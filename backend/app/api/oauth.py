import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import create_access_token
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["oauth"])

# In-memory state store to prevent CSRF on the OAuth redirect.
# Fine for a single-instance dev/small deployment; for multi-instance
# production, swap this for a Redis set with a short TTL.
_pending_states: set[str] = set()


def _issue_state() -> str:
    state = secrets.token_urlsafe(24)
    _pending_states.add(state)
    return state


def _consume_state(state: str) -> bool:
    if state in _pending_states:
        _pending_states.discard(state)
        return True
    return False


def _login_or_create_oauth_user(
    db: Session, *, provider: str, oauth_id: str, email: str, full_name: str | None
) -> User:
    # 1) Already linked to this exact provider account?
    user = db.query(User).filter(
        User.oauth_provider == provider,
        User.oauth_id == oauth_id,
    ).first()
    if user:
        return user

    # 2) An account with this email already exists (e.g. signed up with password,
    #    or via the other OAuth provider) — link this provider onto it.
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.oauth_provider = user.oauth_provider or provider
        user.oauth_id = user.oauth_id or oauth_id
        db.commit()
        db.refresh(user)
        return user

    # 3) Brand new user
    user = User(
        email=email,
        hashed_password=None,
        full_name=full_name,
        oauth_provider=provider,
        oauth_id=oauth_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _redirect_with_token(user: User) -> RedirectResponse:
    token = create_access_token(str(user.id))
    url = f"{settings.frontend_url}/oauth/callback?token={token}"
    return RedirectResponse(url=url)


def _redirect_with_error(message: str) -> RedirectResponse:
    url = f"{settings.frontend_url}/oauth/callback?error={message}"
    return RedirectResponse(url=url)


# ── GOOGLE ───────────────────────────────────────────────────────────────────

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.get("/google/login")
def google_login():
    if not settings.google_client_id:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server.")

    state = _issue_state()
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str | None = None, state: str | None = None, error: str | None = None, db: Session = Depends(get_db)):
    if error:
        return _redirect_with_error("Google sign-in was cancelled.")
    if not code or not state or not _consume_state(state):
        return _redirect_with_error("Invalid or expired sign-in attempt. Please try again.")

    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        })
        if token_res.status_code != 200:
            return _redirect_with_error("Google sign-in failed. Please try again.")
        access_token = token_res.json().get("access_token")

        userinfo_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_res.status_code != 200:
            return _redirect_with_error("Couldn't fetch your Google profile. Please try again.")
        info = userinfo_res.json()

    email = info.get("email")
    if not email:
        return _redirect_with_error("Google account has no email address.")

    user = _login_or_create_oauth_user(
        db,
        provider="google",
        oauth_id=info.get("sub", ""),
        email=email,
        full_name=info.get("name"),
    )
    return _redirect_with_token(user)


# ── LINKEDIN ─────────────────────────────────────────────────────────────────

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"


@router.get("/linkedin/login")
def linkedin_login():
    if not settings.linkedin_client_id:
        raise HTTPException(status_code=500, detail="LinkedIn OAuth is not configured on the server.")

    state = _issue_state()
    params = {
        "response_type": "code",
        "client_id": settings.linkedin_client_id,
        "redirect_uri": settings.linkedin_redirect_uri,
        "state": state,
        "scope": "openid profile email",
    }
    return RedirectResponse(url=f"{LINKEDIN_AUTH_URL}?{urlencode(params)}")


@router.get("/linkedin/callback")
async def linkedin_callback(code: str | None = None, state: str | None = None, error: str | None = None, db: Session = Depends(get_db)):
    if error:
        return _redirect_with_error("LinkedIn sign-in was cancelled.")
    if not code or not state or not _consume_state(state):
        return _redirect_with_error("Invalid or expired sign-in attempt. Please try again.")

    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(
            LINKEDIN_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.linkedin_redirect_uri,
                "client_id": settings.linkedin_client_id,
                "client_secret": settings.linkedin_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_res.status_code != 200:
            return _redirect_with_error("LinkedIn sign-in failed. Please try again.")
        access_token = token_res.json().get("access_token")

        userinfo_res = await client.get(
            LINKEDIN_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_res.status_code != 200:
            return _redirect_with_error("Couldn't fetch your LinkedIn profile. Please try again.")
        info = userinfo_res.json()

    email = info.get("email")
    if not email:
        return _redirect_with_error("LinkedIn account has no verified email address.")

    user = _login_or_create_oauth_user(
        db,
        provider="linkedin",
        oauth_id=info.get("sub", ""),
        email=email,
        full_name=info.get("name"),
    )
    return _redirect_with_token(user)
