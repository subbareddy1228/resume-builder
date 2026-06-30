import io
import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, User
from app.schemas import ResumeOut
from app.api.deps import get_current_user
from app.services.import_resume import extract_text_from_file, parse_resume_with_claude

router = APIRouter(prefix="/api/import", tags=["import"])

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_FILE_SIZE_MB = 8


@router.post("/resume", response_model=ResumeOut)
async def import_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── Plan limit check (counts as creating a resume) ─────────────────────
    current_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    if not current_user.can_create_resume(current_count):
        limit = current_user.limits["resumes"]
        raise HTTPException(
            status_code=403,
            detail=f"Free plan allows {limit} resumes. Upgrade to Pro for unlimited resumes.",
        )

    # ── Validate file ────────────────────────────────────────────────────
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB.")
    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    # ── Extract text ─────────────────────────────────────────────────────
    try:
        text = extract_text_from_file(raw_bytes, ext)
    except Exception:
        raise HTTPException(status_code=400, detail="Couldn't read this file. Make sure it's a valid PDF or DOCX.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in this file. It may be a scanned image.")

    # ── Parse with Claude into ResumeContent ────────────────────────────
    try:
        content = parse_resume_with_claude(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Couldn't parse the resume content. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI parsing failed: {str(e)}")

    title = content.get("contact", {}).get("name") or filename.rsplit(".", 1)[0] or "Imported Resume"

    resume = Resume(
        user_id=current_user.id,
        title=f"{title} (Imported)",
        template="classic",
        content=content,
    )
    db.add(resume)
    db.flush()

    from app.models import ResumeVersion
    db.add(ResumeVersion(
        resume_id=resume.id,
        version_number=1,
        content_snapshot=resume.content,
    ))

    db.commit()
    db.refresh(resume)
    return resume
