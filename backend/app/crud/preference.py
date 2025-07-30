from sqlalchemy.orm import Session
from app.models.preference import Preference

def get_preferences(db: Session, user_id: int):
    return db.query(Preference).filter_by(user_id=user_id).all()

def get_preference(db: Session, user_id: int, key: str):
    return db.query(Preference).filter_by(user_id=user_id, key=key).first()

def set_preference(db: Session, user_id: int, key: str, value: str):
    pref = db.query(Preference).filter_by(user_id=user_id, key=key).first()
    if pref:
        pref.value = value
    else:
        pref = Preference(user_id=user_id, key=key, value=value)
        db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref
