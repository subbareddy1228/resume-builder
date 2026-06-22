import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, User
from app.schemas import ATSRequest, ATSResult
from app.services.ats import score_resume
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/ats", tags=["ats"])


@router.post("/score", response_model=ATSResult)
def get_ats_score(
    payload: ATSRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── Plan limit check ──────────────────────────────────────────────────────
    if not current_user.can_run_ats():
        limit = current_user.limits["ats_scans"]
        raise HTTPException(
            status_code=403,
            detail=f"Free plan allows {limit} ATS scans/month. Upgrade to Pro for unlimited scans.",
        )

    resume = db.query(Resume).filter(
        Resume.id == payload.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not payload.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    result = score_resume(resume.content, payload.jd_text)

    # ── Increment usage ───────────────────────────────────────────────────────
    current_user.increment_ats()
    db.commit()

    return ATSResult(resume_id=payload.resume_id, **result)
