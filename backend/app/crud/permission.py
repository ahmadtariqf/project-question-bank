from sqlalchemy.orm import Session
from app.models.permission import Permission

def get_permission(db: Session, permission_id: int) -> Permission | None:
    return db.query(Permission).get(permission_id)

def get_permissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Permission).offset(skip).limit(limit).all()

def create_permission(db: Session, perm_in) -> Permission:
    db_perm = Permission(name=perm_in.name, description=perm_in.description)
    db.add(db_perm)
    db.commit()
    db.refresh(db_perm)
    return db_perm
