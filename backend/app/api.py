from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from .agents import curriculum, mentor, matching
from datetime import datetime

router = APIRouter()

@router.post("/assess", response_model=schemas.LearningPathResponse)
def create_assessment(req: schemas.AssessmentRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Call Curriculum Agent
    roadmap_data = curriculum.generate_roadmap(req.goal, req.challenges)
    
    # Store learning path
    learning_path = models.LearningPath(
        user_id=user.id,
        primary_goal=roadmap_data.get("primary_goal", req.goal),
        identified_gaps=roadmap_data.get("identified_gaps", "[]"),
        dependent_goal=roadmap_data.get("dependent_goal", ""),
        interested_goal=roadmap_data.get("interested_goal", ""),
        involved_goal=roadmap_data.get("involved_goal", ""),
        self_directed_goal=roadmap_data.get("self_directed_goal", "")
    )
    
    # Optional: Update user stage based on assessment logic (mocking dependent here)
    user.current_stage = models.StageEnum.dependent

    db.add(learning_path)
    db.commit()
    db.refresh(learning_path)
    return learning_path

@router.post("/artifacts", response_model=schemas.ArtifactResponse)
def submit_artifact(artifact: schemas.ArtifactCreate, user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Evaluate Artifact using Mentor Agent
    evaluation = mentor.evaluate_artifact(artifact.content, artifact.type, user.current_stage)
    
    new_artifact = models.Artifact(
        user_id=user.id,
        title=artifact.title,
        type=artifact.type,
        content=artifact.content,
        status=evaluation.get("status", "pending"),
        feedback=evaluation.get("feedback", ""),
        date_submitted=artifact.date_submitted or datetime.now().strftime("%I:%M %p")
    )
    
    db.add(new_artifact)
    
    # Simple stage progression logic based on verified artifact
    if new_artifact.status == "verified":
        if user.current_stage == models.StageEnum.dependent:
            user.current_stage = models.StageEnum.interested
        elif user.current_stage == models.StageEnum.interested:
            user.current_stage = models.StageEnum.involved
            
    db.commit()
    db.refresh(new_artifact)
    return new_artifact

@router.post("/match")
def trigger_matching(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    user_dicts = [{"id": u.id, "major": u.major, "career_interest": u.career_interest} for u in users]
    
    matches = matching.gale_shapley_match(user_dicts)
    
    created_matches = []
    for m in matches:
        partner1, partner2, score = m
        # Check if match exists
        existing = db.query(models.PartnerMatch).filter(
            ((models.PartnerMatch.user1_id == partner1) & (models.PartnerMatch.user2_id == partner2)) |
            ((models.PartnerMatch.user1_id == partner2) & (models.PartnerMatch.user2_id == partner1))
        ).first()
        
        if not existing:
            new_match = models.PartnerMatch(
                user1_id=partner1,
                user2_id=partner2,
                match_score=score,
                next_meeting="Pending Schedule"
            )
            db.add(new_match)
            created_matches.append(new_match)
            
    db.commit()
    return {"message": f"Successfully created {len(created_matches)} new pairings.", "matches": len(matches)}
