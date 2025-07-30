from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.crud.permission import get_permissions, create_permission
from app.schemas.permission import PermissionCreate, PermissionRead
from app.api.deps import get_db, get_current_active_user
from app.api.deps import require_permission


router = APIRouter(
    dependencies=[
        Depends(get_current_active_user),
        require_permission("permission.create")
    ],
)

@router.get("", response_model=List[PermissionRead])
def list_permissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_permissions(db, skip, limit)

@router.post("", response_model=PermissionRead)
def add_permission(perm_in: PermissionCreate, db: Session = Depends(get_db)):
    return create_permission(db, perm_in)
