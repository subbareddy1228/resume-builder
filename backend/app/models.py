import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, event
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base

# Try to import pgvector — if not available, use a plain nullable column instead
try:
    from pgvector.sqlalchemy import Vector
    VECTOR_TYPE = Vector(1536)
    PGVECTOR_AVAILABLE = True
except Exception:
    from sqlalchemy import JSON
    VECTOR_TYPE = JSON
    PGVECTOR_AVAILABLE = False


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="owner", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="Untitled Resume")
    template = Column(String, nullable=False, default="classic")
    content = Column(JSONB, nullable=False, default=dict)
    embedding = Column(VECTOR_TYPE, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content_snapshot = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="versions")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="Job")
    raw_text = Column(Text, nullable=False)
    embedding = Column(VECTOR_TYPE, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="job_descriptions")