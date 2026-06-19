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
    token_type: str = "bearer"
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