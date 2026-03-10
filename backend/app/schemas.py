from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import StageEnum

# ─── Auth ────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

# ─── Onboarding ─────────────────────────────────────────

class OnboardingRequest(BaseModel):
    major: str
    career_interest: str
    goal: str
    challenges: str

# ─── Learning Path ───────────────────────────────────────

class LearningPathBase(BaseModel):
    primary_goal: str
    identified_gaps: str
    dependent_goal: str
    interested_goal: str
    involved_goal: str
    self_directed_goal: str

class LearningPathCreate(LearningPathBase):
    pass

class LearningPathResponse(LearningPathBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# ─── Artifacts ───────────────────────────────────────────

class ArtifactBase(BaseModel):
    title: str
    type: str
    content: str
    date_submitted: str

class ArtifactCreate(ArtifactBase):
    pass

class ArtifactResponse(ArtifactBase):
    id: int
    user_id: int
    status: str
    feedback: Optional[str] = None

    class Config:
        from_attributes = True

# ─── Notifications ───────────────────────────────────────

class NotificationResponse(BaseModel):
    id: int
    text: str
    type: str
    unread: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ─── User ────────────────────────────────────────────────

class UserBase(BaseModel):
    name: str
    email: str
    major: Optional[str] = None
    career_interest: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    current_stage: StageEnum
    onboarding_complete: bool = False
    avatar_url: Optional[str] = None
    auth_provider: str = "local"
    pref_dark_mode: bool = True
    pref_notifications: bool = True
    pref_privacy: bool = True
    learning_path: Optional[LearningPathResponse] = None
    artifacts: List[ArtifactResponse] = []

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    major: Optional[str] = None
    career_interest: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    pref_dark_mode: Optional[bool] = None
    pref_notifications: Optional[bool] = None
    pref_privacy: Optional[bool] = None

# ─── Partner Matching ────────────────────────────────────

class PartnerMatchResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    match_score: int
    next_meeting: str

    class Config:
        from_attributes = True

class MatchingSurveyCreate(BaseModel):
    career_interests: str
    challenges: str
    preferred_schedule: str = "weekly"
    learning_style: str = "hands-on"

# ─── Assessment ──────────────────────────────────────────

class AssessmentRequest(BaseModel):
    goal: str
    challenges: str

# ─── Chat ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# ─── Search ──────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str

# Fix forward reference
TokenResponse.model_rebuild()
