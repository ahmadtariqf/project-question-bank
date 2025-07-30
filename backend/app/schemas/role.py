from pydantic import BaseModel
from typing import List
from app.schemas.permission import PermissionRead

class RoleBase(BaseModel):
    name: str
    description: str | None = None

class RoleCreate(RoleBase):
    permission_ids: List[int] = []

class RoleRead(RoleBase):
    id: int
    permissions: List[PermissionRead] = []

    class Config:
        from_attributes = True
