from sqlalchemy.orm import Session
from app.models.role import Role, user_roles, role_permissions
from app.models.permission import Permission

def get_role(db: Session, role_id: int) -> Role | None:
    return db.query(Role).get(role_id)

def get_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Role).offset(skip).limit(limit).all()

def create_role(db: Session, role_in) -> Role:
    perms = db.query(Permission).filter(Permission.id.in_(role_in.permission_ids)).all()
    db_role = Role(name=role_in.name, description=role_in.description, permissions=perms)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role
