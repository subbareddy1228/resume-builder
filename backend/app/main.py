from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.api.router import api_router

app = FastAPI(title="AI Resume Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def on_startup():
    from sqlalchemy import text
    from sqlalchemy.exc import NotSupportedError, ProgrammingError

    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
    except (NotSupportedError, ProgrammingError):
        print("WARNING: pgvector not available locally. Job matching disabled.")

    # Auto-migrate missing columns
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR;"))
            conn.commit()
    except Exception as e:
        print(f"WARNING: Column migration skipped: {e}")

    try:
        Base.metadata.create_all(bind=engine)
    except ProgrammingError as e:
        if "vector" in str(e):
            print("WARNING: Skipping vector column creation — pgvector not installed locally.")
        else:
            raise


@app.get("/health")
def health_check():
    return {"status": "ok"}