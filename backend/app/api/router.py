from fastapi import APIRouter
from app.api import auth, resumes, ats, ai, export, jobs, billing, import_resume, photos, applications

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(resumes.router)
api_router.include_router(ats.router)
api_router.include_router(ai.router)
api_router.include_router(export.router)
api_router.include_router(jobs.router)
api_router.include_router(billing.router)
api_router.include_router(import_resume.router)
api_router.include_router(photos.router)
api_router.include_router(applications.router)
