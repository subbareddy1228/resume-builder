from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models import Resume, User
from app.services.ai import build_rewrite_prompt, build_bullet_prompt, stream_suggestion
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"])


class RewriteRequest(BaseModel):
    resume_id: uuid.UUID
    section: str
    current_text: str
    job_description: str


class BulletRequest(BaseModel):
    resume_id: uuid.UUID
    bullet: str
    role: str
    job_description: str


def event_stream(prompt: str):
    try:
        for chunk in stream_suggestion(prompt):
            cleaned = chunk.replace("\n", "\\n")
            yield f"data: {cleaned}\n\n"
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"
    finally:
        yield "data: [DONE]\n\n"


@router.post("/rewrite")
def rewrite_section(
    payload: RewriteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == payload.resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not payload.current_text.strip():
        raise HTTPException(status_code=400, detail="No text to rewrite")

    prompt = build_rewrite_prompt(
        payload.section,
        payload.current_text,
        payload.job_description,
    )

    return StreamingResponse(
        event_stream(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/bullet")
def rewrite_bullet(
    payload: BulletRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == payload.resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    prompt = build_bullet_prompt(
        payload.bullet,
        payload.role,
        payload.job_description,
    )

    return StreamingResponse(
        event_stream(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )