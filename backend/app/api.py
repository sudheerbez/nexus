from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from .agents import curriculum, mentor, matching
from .auth import get_current_user
from datetime import datetime

router = APIRouter()


@router.post("/assess", response_model=schemas.LearningPathResponse)
def create_assessment(
    req: schemas.AssessmentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Re-assess and regenerate the user's learning roadmap."""
    # Call Curriculum Agent
    roadmap_data = curriculum.generate_roadmap(req.goal, req.challenges)

    # Check if learning path exists
    existing = db.query(models.LearningPath).filter(
        models.LearningPath.user_id == current_user.id
    ).first()

    if existing:
        existing.primary_goal = roadmap_data.get("primary_goal", req.goal)
        existing.identified_gaps = roadmap_data.get("identified_gaps", "[]")
        existing.dependent_goal = roadmap_data.get("dependent_goal", "")
        existing.interested_goal = roadmap_data.get("interested_goal", "")
        existing.involved_goal = roadmap_data.get("involved_goal", "")
        existing.self_directed_goal = roadmap_data.get("self_directed_goal", "")
        db.commit()
        db.refresh(existing)
        return existing
    else:
        learning_path = models.LearningPath(
            user_id=current_user.id,
            primary_goal=roadmap_data.get("primary_goal", req.goal),
            identified_gaps=roadmap_data.get("identified_gaps", "[]"),
            dependent_goal=roadmap_data.get("dependent_goal", ""),
            interested_goal=roadmap_data.get("interested_goal", ""),
            involved_goal=roadmap_data.get("involved_goal", ""),
            self_directed_goal=roadmap_data.get("self_directed_goal", ""),
        )
        db.add(learning_path)
        db.commit()
        db.refresh(learning_path)
        return learning_path


@router.post("/artifacts", response_model=schemas.ArtifactResponse)
def submit_artifact(
    artifact: schemas.ArtifactCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Submit an artifact for Mentor Agent evaluation."""
    # Evaluate via Mentor Agent
    evaluation = mentor.evaluate_artifact(
        artifact.content, artifact.type, str(current_user.current_stage)
    )

    new_artifact = models.Artifact(
        user_id=current_user.id,
        title=artifact.title,
        type=artifact.type,
        content=artifact.content,
        status=evaluation.get("status", "pending"),
        feedback=evaluation.get("feedback", ""),
        date_submitted=artifact.date_submitted or datetime.now().strftime("%Y-%m-%d"),
    )

    db.add(new_artifact)

    # Stage progression logic
    if new_artifact.status == "verified":
        verified_count = (
            db.query(models.Artifact)
            .filter(
                models.Artifact.user_id == current_user.id,
                models.Artifact.status == "verified",
            )
            .count()
        )
        # Advance stage after each verified artifact
        if current_user.current_stage == models.StageEnum.dependent and verified_count >= 1:
            current_user.current_stage = models.StageEnum.interested
        elif current_user.current_stage == models.StageEnum.interested and verified_count >= 3:
            current_user.current_stage = models.StageEnum.involved
        elif current_user.current_stage == models.StageEnum.involved and verified_count >= 5:
            current_user.current_stage = models.StageEnum.self_directed

    db.commit()
    db.refresh(new_artifact)
    return new_artifact


@router.post("/match")
def trigger_matching(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Run the Gale-Shapley matching algorithm for accountability partners."""
    users = db.query(models.User).filter(models.User.onboarding_complete == True).all()

    if len(users) < 2:
        return {
            "message": "Not enough users for matching. At least 2 onboarded users are required.",
            "matches": 0,
        }

    user_dicts = [
        {"id": u.id, "major": u.major, "career_interest": u.career_interest}
        for u in users
    ]

    matches = matching.gale_shapley_match(user_dicts)

    created_matches = []
    for m in matches:
        partner1, partner2, score = m
        existing = (
            db.query(models.PartnerMatch)
            .filter(
                (
                    (models.PartnerMatch.user1_id == partner1)
                    & (models.PartnerMatch.user2_id == partner2)
                )
                | (
                    (models.PartnerMatch.user1_id == partner2)
                    & (models.PartnerMatch.user2_id == partner1)
                )
            )
            .first()
        )

        if not existing:
            new_match = models.PartnerMatch(
                user1_id=partner1,
                user2_id=partner2,
                match_score=score,
                next_meeting="Pending Schedule",
            )
            db.add(new_match)
            created_matches.append({"user1": partner1, "user2": partner2, "score": score})

    db.commit()
    return {
        "message": f"Successfully created {len(created_matches)} new pairings.",
        "matches": created_matches,
    }


@router.get("/my-partner")
def get_my_partner(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get current user's accountability partner."""
    match = (
        db.query(models.PartnerMatch)
        .filter(
            (models.PartnerMatch.user1_id == current_user.id)
            | (models.PartnerMatch.user2_id == current_user.id)
        )
        .first()
    )

    if not match:
        return {"partner": None, "message": "No partner match found. Run the matching algorithm."}

    partner_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
    partner = db.query(models.User).filter(models.User.id == partner_id).first()

    return {
        "partner": {
            "id": partner.id,
            "name": partner.name,
            "major": partner.major or "Not set",
            "career_interest": partner.career_interest or "Not set",
            "score": match.match_score,
            "next_meeting": match.next_meeting,
        }
    }
