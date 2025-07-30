from pydantic import BaseModel
from datetime import datetime

class PreferenceBase(BaseModel):
    key: str
    value: str

class PreferenceRead(PreferenceBase):
    id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
