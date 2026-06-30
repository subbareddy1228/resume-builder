import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JobApplication, User
from app.schemas import JobApplicationCreate, JobApplicationUpdate, JobApplicationOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/applications", tags=["applications"])

VALID_STATUSES = {"applied", "interview", "offer", "rejected"}


@router.post("", response_model=JobApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app_ = JobApplication(
        user_id=current_user.id,
        resume_id=payload.resume_id,
        company=payload.company,
        role=payload.role,
        status=payload.status if payload.status in VALID_STATUSES else "applied",
        job_url=payload.job_url,
        notes=payload.notes,
        applied_date=payload.applied_date,
    )
    db.add(app_)
    db.commit()
    db.refresh(app_)
    return app_


@router.get("", response_model=List[JobApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .order_by(JobApplication.applied_date.desc())
        .all()
    )


@router.put("/{app_id}", response_model=JobApplicationOut)
def update_application(
    app_id: uuid.UUID,
    payload: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app_ = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id,
    ).first()
    if not app_:
        raise HTTPException(status_code=404, detail="Application not found")

    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    for field, value in data.items():
        setattr(app_, field, value)

    db.commit()
    db.refresh(app_)
    return app_


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app_ = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id,
    ).first()
    if not app_:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app_)
    db.commit()