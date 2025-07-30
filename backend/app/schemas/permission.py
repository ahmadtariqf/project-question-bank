from pydantic import BaseModel

class PermissionBase(BaseModel):
    name: str
    description: str | None = None

class PermissionCreate(PermissionBase):
    pass

class PermissionRead(PermissionBase):
    id: int

    class Config:
        from_attributes = True
