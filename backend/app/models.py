import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base

try:
    from pgvector.sqlalchemy import Vector
    VECTOR_TYPE = Vector(1536)
    PGVECTOR_AVAILABLE = True
except Exception:
    from sqlalchemy import JSON
    VECTOR_TYPE = JSON
    PGVECTOR_AVAILABLE = False


# ── Plan limits ───────────────────────────────────────────────────────────────
PLAN_LIMITS = {
    "free": {
        "resumes":   3,
        "ats_scans": 5,
        "ai_suggestions": 3,
    },
    "pro": {
        "resumes":   999,
        "ats_scans": 999,
        "ai_suggestions": 999,
    },
}


class User(Base):
    __tablename__ = "users"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email            = Column(String, unique=True, index=True, nullable=False)
    hashed_password  = Column(String, nullable=False)
    full_name        = Column(String, nullable=True)

    # Stripe billing
    plan             = Column(String, nullable=False, default="free")   # "free" | "pro"
    stripe_customer_id      = Column(String, nullable=True, unique=True)
    stripe_subscription_id  = Column(String, nullable=True, unique=True)
    subscription_status     = Column(String, nullable=True)             # active | canceled | past_due

    # Monthly usage counters (reset each month)
    ats_scans_this_month        = Column(Integer, nullable=False, default=0)
    ai_suggestions_this_month   = Column(Integer, nullable=False, default=0)
    usage_reset_at              = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes          = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="owner", cascade="all, delete-orphan")

    # ── helpers ──────────────────────────────────────────────────────────────
    def _reset_if_new_month(self):
        now = datetime.utcnow()
        if self.usage_reset_at is None or (
            now.year != self.usage_reset_at.year or
            now.month != self.usage_reset_at.month
        ):
            self.ats_scans_this_month      = 0
            self.ai_suggestions_this_month = 0
            self.usage_reset_at            = now

    def can_create_resume(self, current_count: int) -> bool:
        return current_count < PLAN_LIMITS[self.plan]["resumes"]

    def can_run_ats(self) -> bool:
        self._reset_if_new_month()
        return self.ats_scans_this_month < PLAN_LIMITS[self.plan]["ats_scans"]

    def can_use_ai(self) -> bool:
        self._reset_if_new_month()
        return self.ai_suggestions_this_month < PLAN_LIMITS[self.plan]["ai_suggestions"]

    def increment_ats(self):
        self._reset_if_new_month()
        self.ats_scans_this_month += 1

    def increment_ai(self):
        self._reset_if_new_month()
        self.ai_suggestions_this_month += 1

    @property
    def limits(self) -> dict:
        return PLAN_LIMITS[self.plan]

    @property
    def usage(self) -> dict:
        self._reset_if_new_month()
        return {
            "ats_scans":      self.ats_scans_this_month,
            "ai_suggestions": self.ai_suggestions_this_month,
        }


class Resume(Base):
    __tablename__ = "resumes"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title     = Column(String, nullable=False, default="Untitled Resume")
    template  = Column(String, nullable=False, default="classic")
    content   = Column(JSONB, nullable=False, default=dict)
    embedding = Column(VECTOR_TYPE, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner    = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id      = Column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content_snapshot = Column(JSONB, nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="versions")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title     = Column(String, nullable=False, default="Job")
    raw_text  = Column(Text, nullable=False)
    embedding = Column(VECTOR_TYPE, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="job_descriptions")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token      = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used       = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)