from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, api
from .database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexus Mission Control API")

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api", tags=["core"])

@app.get("/")
def read_root():
    return {"message": "Nexus Mission Control API Active"}

@app.get("/api/dashboard/{user_id}", response_model=schemas.UserResponse)
def get_user_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # Create a full mock setup for the frontend UI dev
        user = models.User(
            name="Test Student", 
            email="student@nexus.edu", 
            major="Computer Science", 
            career_interest="Software Engineering",
            current_stage=models.StageEnum.interested
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Add a default learning path
        lp = models.LearningPath(
            user_id=user.id,
            primary_goal="Learn Full-Stack Development",
            identified_gaps='["State Management", "API Design"]',
            dependent_goal="Understand basic syntax.",
            interested_goal="Build a React dashboard.",
            involved_goal="Connect React to FastAPI.",
            self_directed_goal="Deploy the application."
        )
        db.add(lp)
        db.commit()
        
    return user
