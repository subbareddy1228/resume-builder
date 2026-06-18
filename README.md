# AI Resume Builder — Phase 1 Scaffold (Auth)

This is the Phase 1 vertical slice: working registration, login, JWT auth,
and a protected dashboard route, on both the FastAPI backend and the React
frontend. No resume features yet — that's Phase 2.

## What's included

**Backend (`/backend`)** — FastAPI app with a `User` model, JWT-based
register/login/me endpoints, password hashing (bcrypt), and CORS configured
for the Vite dev server. Tables are created automatically on startup via
`Base.metadata.create_all` for now — switch to Alembic migrations once the
schema stabilizes in later phases.

**Frontend (`/frontend`)** — Vite + React + TypeScript + Tailwind. Login and
register pages, an `AuthContext` for global auth state, a protected
`/dashboard` route, and an Axios client that attaches the JWT to every
request automatically.

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit SECRET_KEY to a real random string

docker compose up -d            # starts Postgres on localhost:5432

uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` to see the interactive API docs and try
register/login directly.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL should point at the backend

npm run dev
```

Visit `http://localhost:5173`. Register an account, you'll be redirected to
the dashboard placeholder.

## A few things worth knowing

The JWT is stored in `localStorage` for simplicity in this scaffold. The
original blueprint called for an httpOnly cookie instead, which is more
resistant to XSS token theft. That's a reasonable upgrade to make before
shipping to real users — it requires the backend to set the cookie on
login/register and the frontend to stop manually attaching the
`Authorization` header, relying on the cookie being sent automatically
instead.

`Base.metadata.create_all` is fine for solo development but doesn't track
schema changes. Once you add the `resumes` table in Phase 2, this is the
right time to set up Alembic properly so you have real migrations.

The `SECRET_KEY` in `.env.example` is a placeholder — generate a real one
before running anything beyond local testing, e.g. `python -c "import
secrets; print(secrets.token_hex(32))"`.

## Verified working

Both sides were built and checked before this was handed off: the FastAPI
app imports cleanly and exposes `/api/auth/register`, `/api/auth/login`,
`/api/auth/me`, and `/health`. The frontend type-checks with `tsc -b` and
produces a clean production build with `vite build`.

## Next phase

Phase 2 is Resume CRUD: a `resumes` table with JSONB content, the four CRUD
endpoints, and a dashboard that actually lists/creates/deletes resumes
instead of showing a placeholder.
