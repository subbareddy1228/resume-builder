import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Resume ────────────────────────────────────────────────────────────────────

class ResumeCreate(BaseModel):
    title: str = "Untitled Resume"
    template: str = "classic"
    content: dict[str, Any] = {}


class ResumeUpdate(BaseModel):
    title: str | None = None
    template: str | None = None
    content: dict[str, Any] | None = None


class ResumeOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    template: str
    content: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeVersionOut(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    version_number: int
    content_snapshot: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# ── ATS ───────────────────────────────────────────────────────────────────────

class ATSRequest(BaseModel):
    resume_id: uuid.UUID
    jd_text: str


class ATSResult(BaseModel):
    resume_id: uuid.UUID
    score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    total_keywords: int
    checklist: list[dict] = []


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ProfileOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None
    plan: str
    created_at: datetime
    resume_count: int
    ats_scans_used: int
    ats_scans_limit: int
    ai_suggestions_used: int
    ai_suggestions_limit: int

    class Config:
        from_attributes = True

class ATSHistoryItem(BaseModel):
    id: uuid.UUID
    score: int
    jd_snippet: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class JobApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "applied"
    job_url: str | None = None
    notes: str | None = None
    resume_id: uuid.UUID | None = None
    applied_date: datetime | None = None


class JobApplicationUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    status: str | None = None
    job_url: str | None = None
    notes: str | None = None
    resume_id: uuid.UUID | None = None
    applied_date: datetime | None = None


class JobApplicationOut(BaseModel):
    id: uuid.UUID
    company: str
    role: str
    status: str
    job_url: str | None
    notes: str | None
    resume_id: uuid.UUID | None
    applied_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True