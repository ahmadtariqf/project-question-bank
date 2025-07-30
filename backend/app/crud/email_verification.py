import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.email_verification import EmailVerificationCode

def create_email_verification_code(db: Session, user_id: int) -> EmailVerificationCode:
    code = secrets.token_hex(3)  # 6‑char hex
    # get a timezone‑aware “now” in UTC
    now_utc = datetime.now(timezone.utc)
    expires = now_utc + timedelta(hours=1)    
    ev = EmailVerificationCode(user_id=user_id, code=code, expires_at=expires)
    db.add(ev); db.commit(); db.refresh(ev)
    return ev

def verify_email_code(db: Session, user_id: int, code: str) -> bool:
    ev = (
        db.query(EmailVerificationCode)
          .filter_by(user_id=user_id, code=code, used=False)
          .first()
    )
    now = datetime.now(timezone.utc)
    if not ev or ev.expires_at < now:
        return False
    ev.used = True
    db.commit()
    return True
