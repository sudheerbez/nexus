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


@app.post("/api/chat")
def mentor_chat(request: schemas.ChatRequest):
    """Chat with the Mentor Agent for Socratic Q&A."""
    from .agents import mentor
    import os
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Intelligent fallback responses when no API key
        responses = {
            "default": "That's a great question! Think about what fundamental concept underlies this problem. What would happen if you broke it down into smaller pieces?",
            "help": "I'm here to guide you using Socratic questioning. Rather than giving direct answers, I'll ask questions that help you discover the solution yourself. What specific concept are you struggling with?",
            "stuck": "When we feel stuck, it often means we need to revisit our assumptions. What do you already know about this topic? Can you identify the specific part that's confusing?",
            "code": "Before writing code, let's think through the logic. What inputs does your function need? What output should it produce? Can you trace through an example by hand?",
        }
        msg = request.message.lower()
        if any(w in msg for w in ["help", "how", "what"]):
            reply = responses["help"]
        elif any(w in msg for w in ["stuck", "confused", "don't understand"]):
            reply = responses["stuck"]
        elif any(w in msg for w in ["code", "function", "bug", "error"]):
            reply = responses["code"]
        else:
            reply = responses["default"]
        return {"reply": reply}
    
    # Use Gemini when API key is available
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        prompt = f"""You are the Nexus Mentor Agent, a Socratic guide. 
        The student asks: "{request.message}"
        
        Respond with 2-3 sentences using Socratic questioning to guide them 
        toward deeper understanding. Don't give direct answers — ask thoughtful 
        questions that lead them to discover the answer themselves."""
        
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": f"I encountered an issue, but let me still help: What specific aspect of your question would you like to explore further?"}


@app.put("/api/users/{user_id}")
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update user profile settings."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.major is not None:
        user.major = user_update.major
    if user_update.career_interest is not None:
        user.career_interest = user_update.career_interest
    
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": {"name": user.name, "email": user.email, "major": user.major, "career_interest": user.career_interest}}
