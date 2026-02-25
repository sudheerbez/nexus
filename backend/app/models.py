from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
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
    email = Column(String, unique=True, index=True)
    major = Column(String)
    career_interest = Column(String)
    current_stage = Column(Enum(StageEnum), default=StageEnum.dependent)

    learning_path = relationship("LearningPath", back_populates="user", uselist=False)
    artifacts = relationship("Artifact", back_populates="user")

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    primary_goal = Column(String)
    identified_gaps = Column(String) # Stored as JSON string list
    
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
    type = Column(String) # code, terminal, document
    content = Column(String) # The actual code snippet or log
    status = Column(String, default="pending") # pending, verified, rejected
    feedback = Column(String) # Socratic feedback from Mentor Agent
    date_submitted = Column(String)

    user = relationship("User", back_populates="artifacts")

class PartnerMatch(Base):
    __tablename__ = "partner_matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    match_score = Column(Integer) # Percentage score
    next_meeting = Column(String)
