from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.schemas.user import UserRead
from app.api.deps import get_current_active_user, get_db
from sqlalchemy.orm import Session
import time
from app.crud.preference import (
    get_preferences,
    get_preference,
    set_preference,
)
from app.schemas.preference import PreferenceRead, PreferenceBase
from app.schemas.user import UserUpdate

router = APIRouter()


@router.get("/session", response_model=UserRead, tags=["users"])
def get_me(current_user = Depends(get_current_active_user)):
    """
    Returns the logged-in user's profile (from session cookie).
    """
    return current_user


@router.get("/me", response_model=UserRead, tags=["users"])
def read_users_me(current_user = Depends(get_current_active_user)):
    """
    Returns the logged‑in user’s profile.
    """
    return current_user

@router.put("/me", response_model=UserRead, tags=["users"])
def update_profile(
    user_update: UserUpdate,  # we’ll use the same Base for first/last name etc but here’s an example
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    updates = user_update.dict(exclude_unset=True)
    for field, value in updates.items():
        setattr(current_user, field, value)    
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/preferences", response_model=list[PreferenceRead], tags=["users"])
def list_preferences(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # time.sleep(5)  # Simulating a delay for demonstration purposes
    return get_preferences(db, current_user.id)

@router.get("/me/preferences/{key}", response_model=PreferenceRead, tags=["users"])
def read_preference(
    key: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    pref = get_preference(db, current_user.id, key)
    if not pref:
        raise HTTPException(status_code=404, detail="Preference not found")
    return pref

@router.put("/me/preferences/{key}", response_model=PreferenceRead, tags=["users"])
def upsert_preference(
    key: str,
    body: PreferenceBase,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return set_preference(db, current_user.id, key, body.value)