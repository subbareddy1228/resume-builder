import uuid
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, PasswordResetToken
from app.schemas import UserCreate, UserLogin, Token, UserOut
from app.security import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _send_reset_email(to_email: str, reset_url: str):
    if not settings.resend_api_key:
        print(f"[DEV] Reset URL: {reset_url}")
        return
    try:
        import resend
        resend.api_key = settings.resend_api_key
        resend.Emails.send({
            "from": settings.resend_from_email,
            "to": to_email,
            "subject": "Reset your Resume Builder password",
            "html": f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
              <h2 style="color:#1a1a1a;margin-bottom:8px;">Reset your password</h2>
              <p style="color:#666;margin-bottom:24px;">
                Click the button below to reset your password. This link expires in 1 hour.
              </p>
              <a href="{reset_url}"
                style="background:#3E5C46;color:white;padding:12px 24px;
                       border-radius:4px;text-decoration:none;font-weight:500;display:inline-block;">
                Reset Password
              </a>
              <p style="color:#999;font-size:12px;margin-top:24px;">
                If you didn't request this, ignore this email.
              </p>
            </div>
            """,
        })
    except Exception as e:
        print(f"Email send failed: {e}")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(str(user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = db.query(User).filter(User.email == email).first()

    # Always return success — don't reveal if email exists
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    # Invalidate old tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True})
    db.commit()

    # Create new token
    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    _send_reset_email(user.email, reset_url)

    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: dict, db: Session = Depends(get_db)):
    token    = payload.get("token", "").strip()
    password = payload.get("password", "").strip()

    if not token or not password:
        raise HTTPException(status_code=400, detail="Token and password are required")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset link has expired. Request a new one.")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password   = hash_password(password)
    reset_token.used       = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}