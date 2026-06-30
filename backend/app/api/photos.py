import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/photos", tags=["photos"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "photos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB = 4


@router.post("/{resume_id}")
async def upload_photo(
    resume_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are supported.")

    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Image too large. Max {MAX_FILE_SIZE_MB}MB.")
    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[file.content_type]
    filename = f"{resume_id}.{ext}"
    filepath = UPLOAD_DIR / filename

    # Remove any previous photo for this resume (different extension)
    for old in UPLOAD_DIR.glob(f"{resume_id}.*"):
        old.unlink(missing_ok=True)

    filepath.write_bytes(raw_bytes)

    photo_url = f"/api/photos/{resume_id}/file"

    content = dict(resume.content or {})
    content["photo_url"] = photo_url
    resume.content = content
    db.commit()
    db.refresh(resume)

    return {"photo_url": photo_url}


@router.get("/{resume_id}/file")
def get_photo(resume_id: uuid.UUID):
    for ext in ("jpg", "jpeg", "png", "webp"):
        filepath = UPLOAD_DIR / f"{resume_id}.{ext}"
        if filepath.exists():
            return FileResponse(filepath)
    raise HTTPException(status_code=404, detail="Photo not found")


@router.delete("/{resume_id}")
def delete_photo(
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

    for old in UPLOAD_DIR.glob(f"{resume_id}.*"):
        old.unlink(missing_ok=True)

    content = dict(resume.content or {})
    content.pop("photo_url", None)
    resume.content = content
    db.commit()

    return {"status": "deleted"}
