import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.password_reset import PasswordResetCode
from app.models.user import User
from app.core.security import get_password_hash

def create_password_reset_code(db: Session, user_id: int) -> PasswordResetCode:
    code = secrets.token_hex(3)
    now_utc = datetime.now(timezone.utc)
    expires = now_utc + timedelta(hours=1)    
    pr = PasswordResetCode(user_id=user_id, code=code, expires_at=expires)
    db.add(pr); db.commit(); db.refresh(pr)
    return pr

def reset_password(db: Session, user_id: int, code: str, new_password: str) -> bool:
    pr = (
        db.query(PasswordResetCode)
          .filter_by(user_id=user_id, code=code, used=False)
          .first()
    )
    now = datetime.now(timezone.utc)
    if not pr or pr.expires_at < now:
        return False
    user = db.query(User).get(user_id)
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    pr.used = True
    db.commit()
    return True

