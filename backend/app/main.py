from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, api
from .database import engine, get_db
from .auth import hash_password, verify_password, create_access_token, get_current_user, verify_google_token
from .agents import curriculum

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexus Mission Control API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api", tags=["core"])


# ─── Public Routes ───────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Nexus Mission Control API Active"}


@app.post("/auth/signup", response_model=schemas.TokenResponse)
def signup(req: schemas.SignupRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if email already exists
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = models.User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        auth_provider="local",
        onboarding_complete=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return schemas.TokenResponse(access_token=token, user=user)


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.email)
    return schemas.TokenResponse(access_token=token, user=user)


@app.post("/auth/google", response_model=schemas.TokenResponse)
def google_auth(req: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth ID token using proper verification."""
    # Verify the Google ID token using google-auth library
    google_info = verify_google_token(req.credential)
    
    google_email = google_info["email"]
    google_name = google_info["name"]
    google_id = google_info["sub"]
    google_picture = google_info.get("picture")
    
    if not google_email:
        raise HTTPException(status_code=400, detail="Invalid Google token: no email found")
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == google_email).first()
    
    if not user:
        # Create new user from Google
        user = models.User(
            name=google_name,
            email=google_email,
            auth_provider="google",
            google_id=google_id,
            avatar_url=google_picture,
            onboarding_complete=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.auth_provider == "local":
        # Link Google to existing account
        user.google_id = google_id
        user.avatar_url = google_picture
        db.commit()
        db.refresh(user)
    
    token = create_access_token(user.id, user.email)
    return schemas.TokenResponse(access_token=token, user=user)


# ─── Protected Routes ────────────────────────────────────

@app.get("/api/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user's full dashboard data."""
    return current_user


@app.post("/api/onboarding", response_model=schemas.UserResponse)
def complete_onboarding(
    req: schemas.OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Complete onboarding: set profile, generate roadmap via Curriculum Agent."""
    # Update profile
    current_user.major = req.major
    current_user.career_interest = req.career_interest

    # Generate roadmap via Curriculum Agent
    roadmap_data = curriculum.generate_roadmap(req.goal, req.challenges)

    # Check if learning path already exists
    existing_lp = db.query(models.LearningPath).filter(
        models.LearningPath.user_id == current_user.id
    ).first()

    if existing_lp:
        existing_lp.primary_goal = roadmap_data.get("primary_goal", req.goal)
        existing_lp.identified_gaps = roadmap_data.get("identified_gaps", "[]")
        existing_lp.dependent_goal = roadmap_data.get("dependent_goal", "")
        existing_lp.interested_goal = roadmap_data.get("interested_goal", "")
        existing_lp.involved_goal = roadmap_data.get("involved_goal", "")
        existing_lp.self_directed_goal = roadmap_data.get("self_directed_goal", "")
    else:
        lp = models.LearningPath(
            user_id=current_user.id,
            primary_goal=roadmap_data.get("primary_goal", req.goal),
            identified_gaps=roadmap_data.get("identified_gaps", "[]"),
            dependent_goal=roadmap_data.get("dependent_goal", ""),
            interested_goal=roadmap_data.get("interested_goal", ""),
            involved_goal=roadmap_data.get("involved_goal", ""),
            self_directed_goal=roadmap_data.get("self_directed_goal", ""),
        )
        db.add(lp)

    current_user.current_stage = models.StageEnum.dependent
    current_user.onboarding_complete = True
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/chat")
def mentor_chat(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
):
    """Chat with the Mentor Agent for Socratic Q&A."""
    from .agents import mentor
    import os

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {
            "reply": "The Mentor Agent requires a Gemini API key to be configured on the server. Please contact your administrator to set the GEMINI_API_KEY environment variable."
        }

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""You are the Nexus Mentor Agent, a Socratic guide helping {current_user.name}.
        They are currently in the "{current_user.current_stage}" stage, studying {current_user.major or 'general topics'}.
        
        The student asks: "{request.message}"
        
        Respond with 2-3 sentences using Socratic questioning to guide them 
        toward deeper understanding. Don't give direct answers — ask thoughtful 
        questions that lead them to discover the answer themselves."""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": f"I encountered an issue: {str(e)}. Please try again."}


@app.put("/api/users/me", response_model=schemas.UserResponse)
def update_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update current user's profile."""
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        # Check email uniqueness
        existing = db.query(models.User).filter(
            models.User.email == user_update.email,
            models.User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_update.email
    if user_update.major is not None:
        current_user.major = user_update.major
    if user_update.career_interest is not None:
        current_user.career_interest = user_update.career_interest

    db.commit()
    db.refresh(current_user)
    return current_user
