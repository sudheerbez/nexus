from pydantic import BaseModel
from typing import Optional, List
from .models import StageEnum

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

class UserBase(BaseModel):
    name: str
    email: str
    major: str
    career_interest: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    current_stage: StageEnum
    learning_path: Optional[LearningPathResponse] = None
    artifacts: List[ArtifactResponse] = []

    class Config:
        from_attributes = True

class PartnerMatchResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    match_score: int
    next_meeting: str

    class Config:
        from_attributes = True

class AssessmentRequest(BaseModel):
    user_id: int
    goal: str
    challenges: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    major: Optional[str] = None
    career_interest: Optional[str] = None

