from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from .database import Base

class StageEnum(str, enum.Enum):
    dependent = "Dependent"
    interested = "Interested"
    involved = "Involved"
    self_directed = "Self-Directed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Null for Google OAuth users
    auth_provider = Column(String, default="local")  # "local" or "google"
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    major = Column(String, nullable=True)
    career_interest = Column(String, nullable=True)
    current_stage = Column(Enum(StageEnum), default=StageEnum.dependent)
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    learning_path = relationship("LearningPath", back_populates="user", uselist=False)
    artifacts = relationship("Artifact", back_populates="user")
    matching_survey = relationship("MatchingSurvey", back_populates="user", uselist=False)

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    primary_goal = Column(String)
    identified_gaps = Column(String)  # Stored as JSON string list
    
    # 4-stage Roadmap Details
    dependent_goal = Column(String)
    interested_goal = Column(String)
    involved_goal = Column(String)
    self_directed_goal = Column(String)

    user = relationship("User", back_populates="learning_path")

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    type = Column(String)  # code, terminal, document
    content = Column(String)
    status = Column(String, default="pending")  # pending, verified, rejected
    feedback = Column(String)
    date_submitted = Column(String)

    user = relationship("User", back_populates="artifacts")

class PartnerMatch(Base):
    __tablename__ = "partner_matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    match_score = Column(Integer)
    next_meeting = Column(String)

class MatchingSurvey(Base):
    __tablename__ = "matching_surveys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    career_interests = Column(String)
    challenges = Column(String)
    preferred_schedule = Column(String)  # "weekly" or "biweekly"
    learning_style = Column(String)  # "visual", "hands-on", "reading", "collaborative"

    user = relationship("User", back_populates="matching_survey")
