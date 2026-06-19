import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, ResumeVersion
from app.schemas import ResumeCreate, ResumeUpdate, ResumeOut, ResumeVersionOut
from app.api.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


def _snapshot(db: Session, resume: Resume):
    last = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == resume.id)
        .order_by(ResumeVersion.version_number.desc())
        .first()
    )
    next_version = (last.version_number + 1) if last else 1
    snapshot = ResumeVersion(
        resume_id=resume.id,
        version_number=next_version,
        content_snapshot=resume.content,
    )
    db.add(snapshot)


@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def create_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = Resume(
        user_id=current_user.id,
        title=payload.title,
        template=payload.template,
        content=payload.content,
    )
    db.add(resume)
    db.flush()
    _snapshot(db, resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("", response_model=List[ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Resume).filter(Resume.user_id == current_user.id).all()


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
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
    return resume


@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: uuid.UUID,
    payload: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if payload.title is not None:
        resume.title = payload.title
    if payload.template is not None:
        resume.template = payload.template
    if payload.content is not None:
        resume.content = payload.content
        _snapshot(db, resume)

    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
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
    db.delete(resume)
    db.commit()


@router.get("/{resume_id}/versions", response_model=List[ResumeVersionOut])
def list_versions(
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
    return resume.versions