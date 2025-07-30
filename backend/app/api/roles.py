from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.crud.role import get_roles, create_role
from app.schemas.role import RoleCreate, RoleRead
from app.api.deps import get_db, get_current_active_user
from app.api.deps import require_permission


router = APIRouter(
    dependencies=[
        Depends(get_current_active_user), 
        require_permission("role.create")
    ],
)

@router.get("", response_model=List[RoleRead])
def list_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_roles(db, skip, limit)

@router.post("", response_model=RoleRead)
def add_role(role_in: RoleCreate, db: Session = Depends(get_db)):
    return create_role(db, role_in)
