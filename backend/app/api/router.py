from fastapi import APIRouter

from app.api import auth, resumes, ats, ai, export, jobs

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(resumes.router)
api_router.include_router(ats.router)
api_router.include_router(ai.router)
api_router.include_router(export.router)
api_router.include_router(jobs.router)