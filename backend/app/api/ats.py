import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, User, ATSScoreHistory
from app.schemas import ATSRequest, ATSResult, ATSHistoryItem
from app.services.ats import score_resume
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/ats", tags=["ats"])


@router.post("/score", response_model=ATSResult)
def get_ats_score(
    payload: ATSRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    current_user.increment_ats()

    history_entry = ATSScoreHistory(
        resume_id=resume.id,
        user_id=current_user.id,
        score=result["score"],
        jd_snippet=payload.jd_text.strip()[:80],
    )
    db.add(history_entry)
    db.commit()

    return ATSResult(resume_id=payload.resume_id, **result)


@router.get("/history/{resume_id}", response_model=List[ATSHistoryItem])
def get_ats_history(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    history = db.query(ATSScoreHistory).filter(
        ATSScoreHistory.resume_id == resume_id,
        ATSScoreHistory.user_id == current_user.id,
    ).order_by(ATSScoreHistory.created_at.asc()).all()

    return history