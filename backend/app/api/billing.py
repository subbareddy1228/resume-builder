from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.config import settings
from app.api.deps import get_current_user
from app.schemas import UserOut

router = APIRouter(prefix="/api/billing", tags=["billing"])


def get_stripe():
    try:
        import stripe
        stripe.api_key = settings.stripe_secret_key
        return stripe
    except ImportError:
        raise HTTPException(status_code=503, detail="Stripe not configured")


# ── GET /api/billing/status ───────────────────────────────────────────────────
@router.get("/status")
def billing_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_count = db.query(User).join(User.resumes).filter(User.id == current_user.id).count()
    return {
        "plan": current_user.plan,
        "subscription_status": current_user.subscription_status,
        "limits": current_user.limits,
        "usage": {
            "resumes": db.execute(
                __import__("sqlalchemy").text(
                    "SELECT COUNT(*) FROM resumes WHERE user_id = :uid"
                ),
                {"uid": str(current_user.id)},
            ).scalar(),
            **current_user.usage,
        },
    }


# ── POST /api/billing/create-checkout ────────────────────────────────────────
@router.post("/create-checkout")
def create_checkout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.plan == "pro":
        raise HTTPException(status_code=400, detail="Already on Pro plan")

    stripe = get_stripe()
    if not settings.stripe_pro_price_id:
        raise HTTPException(status_code=503, detail="Stripe price not configured")

    # Create or reuse Stripe customer
    if not current_user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            name=current_user.full_name or "",
            metadata={"user_id": str(current_user.id)},
        )
        current_user.stripe_customer_id = customer.id
        db.commit()

    session = stripe.checkout.Session.create(
        customer=current_user.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": settings.stripe_pro_price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.frontend_url}/dashboard?upgrade=success",
        cancel_url=f"{settings.frontend_url}/dashboard?upgrade=cancelled",
        metadata={"user_id": str(current_user.id)},
    )
    return {"checkout_url": session.url}


# ── POST /api/billing/create-portal ──────────────────────────────────────────
@router.post("/create-portal")
def create_portal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")

    stripe = get_stripe()
    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=f"{settings.frontend_url}/dashboard",
    )
    return {"portal_url": session.url}


# ── POST /api/billing/webhook ─────────────────────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db),
):
    stripe = get_stripe()
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.stripe_webhook_secret
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    data = event["data"]["object"]

    # ── Subscription activated ────────────────────────────────────────────────
    if event["type"] in ("customer.subscription.created", "customer.subscription.updated"):
        customer_id = data.get("customer")
        status      = data.get("status")
        sub_id      = data.get("id")

        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.stripe_subscription_id = sub_id
            user.subscription_status    = status
            user.plan = "pro" if status == "active" else "free"
            db.commit()

    # ── Subscription cancelled ────────────────────────────────────────────────
    elif event["type"] == "customer.subscription.deleted":
        customer_id = data.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.plan                   = "free"
            user.subscription_status    = "canceled"
            user.stripe_subscription_id = None
            db.commit()

    # ── Payment failed ────────────────────────────────────────────────────────
    elif event["type"] == "invoice.payment_failed":
        customer_id = data.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = "past_due"
            db.commit()

    return {"received": True}
