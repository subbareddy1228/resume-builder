import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import Resume, JobDescription, User
from app.services.embeddings import get_embedding, cosine_similarity
from app.services.ats import flatten_resume
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobCreate(BaseModel):
    title: str = "Job"
    raw_text: str


class JobOut(BaseModel):
    id: uuid.UUID
    title: str
    raw_text: str
    created_at: str

    class Config:
        from_attributes = True

    def model_post_init(self, __context):
        self.created_at = str(self.created_at)


class MatchResult(BaseModel):
    job_id: uuid.UUID
    job_title: str
    resume_id: uuid.UUID
    resume_title: str
    match_score: int
    similarity: float


@router.post("", status_code=status.HTTP_201_CREATED)
def save_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    embedding = get_embedding(payload.raw_text[:8000])
    job = JobDescription(
        user_id=current_user.id,
        title=payload.title,
        raw_text=payload.raw_text,
        embedding=embedding,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"id": str(job.id), "title": job.title, "message": "Job saved"}


@router.post("/match")
def match_resume_to_jobs(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_id = payload.get("resume_id")
    if not resume_id:
        raise HTTPException(status_code=400, detail="resume_id required")

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_text = flatten_resume(resume.content)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume has no content to embed")

    resume_embedding = get_embedding(resume_text[:8000])

    resume.embedding = resume_embedding
    db.commit()

    jobs = db.query(JobDescription).filter(
        JobDescription.user_id == current_user.id,
        JobDescription.embedding.isnot(None),
    ).all()

    if not jobs:
        raise HTTPException(status_code=404, detail="No saved jobs found. Save a job first.")

    results = []
    for job in jobs:
        sim = cosine_similarity(resume_embedding, job.embedding)
        score = round(sim * 100)
        results.append(MatchResult(
            job_id=job.id,
            job_title=job.title,
            resume_id=resume.id,
            resume_title=resume.title,
            match_score=score,
            similarity=round(sim, 4),
        ))

    results.sort(key=lambda r: r.match_score, reverse=True)
    return results