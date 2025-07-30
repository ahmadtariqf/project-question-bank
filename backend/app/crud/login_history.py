from datetime import datetime
from sqlalchemy.orm import Session
from app.models.login_history import LoginHistory

def create_login_history(db: Session, user_id: int, ip_address: str | None = None) -> LoginHistory:
    log = LoginHistory(user_id=user_id, ip_address=ip_address)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def update_logout_time(db: Session, login_history_id: int) -> LoginHistory:
    log = db.query(LoginHistory).get(login_history_id)
    if log:
        log.logout_at = datetime.utcnow()
        db.commit()
        db.refresh(log)
    return log
