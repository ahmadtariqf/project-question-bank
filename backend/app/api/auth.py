from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import asyncio

from app.db.deps import get_db
from app.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate, UserRead
from app.schemas.token import Token
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
)
from app.schemas.auth_ext import (
    EmailVerificationRequest,
    EmailVerificationVerify,
    PasswordResetRequest,
    PasswordResetVerify,
    SignupRequest
)
from app.core.email import send_verification_email, send_password_reset_email
from app.core.config import settings
from app.crud.login_history import create_login_history, update_logout_time
from app.api.deps import oauth2_scheme
from app.crud.email_verification import (
    create_email_verification_code,
    verify_email_code,
)
from app.crud.password_reset import (
    create_password_reset_code,
    reset_password,
)
router = APIRouter()


@router.post("/signup", response_model=UserRead, tags=["auth"])
async def signup(
    signup: SignupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if get_user_by_email(db, signup.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    # create user
    user_in = UserCreate(
        first_name=signup.first_name,
        last_name=signup.last_name,
        email=signup.email,
        phone=signup.phone,
        password=signup.password,
    )
    user = create_user(db, user_in)
    
    # generate & store code:
    ev = create_email_verification_code(db, user.id)

    verify_link = f"{settings.FRONTEND_URL}/verify-email?code={ev.code}&email={user.email}"
    # schedule the email send in the background:
    background_tasks.add_task(send_verification_email, user.email, ev.code, user.first_name, verify_link)

    return user

@router.post("/send-verification", status_code=202, tags=["auth"])
async def send_email_verification(
    data: EmailVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(404, "User not found")
    ev = create_email_verification_code(db, user.id)
    verify_link = f"{settings.FRONTEND_URL}/verify-email?code={ev.code}&email={user.email}"
    background_tasks.add_task(
        send_verification_email,
        user.email,
        ev.code,
        user.first_name,
        verify_link,
    )
    return {"msg": "Verification code sent"}

@router.post("/verify-email", status_code=200, tags=["auth"])
def verify_email(data: EmailVerificationVerify, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(404, "User not found")
    if not verify_email_code(db, user.id, data.code):
        raise HTTPException(400, "Invalid or expired code")
    user.email_verified = True
    db.commit()
    return {"msg": "Email verified"}

@router.post("/login", response_model=Token, tags=["auth"])
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, form_data.username)

    # lockout check
    now = datetime.utcnow()
    if user and user.lockout_until and user.lockout_until > now:
        raise HTTPException(status_code=423, detail="Account locked. Try again later.")

    if not user or not verify_password(form_data.password, user.hashed_password):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
                user.lockout_until = now + timedelta(minutes=settings.LOCKOUT_TIME_MINUTES)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # reset failures & record last_login
    user.failed_login_attempts = 0
    user.lockout_until = None
    user.last_login_at = now
    db.commit()

    # record login history
    login_log = create_login_history(db, user.id, request.client.host)

    # issue tokens
    access_token = create_access_token(
        {"sub": str(user.id), "login_id": str(login_log.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(
        {"sub": str(user.id), "login_id": str(login_log.id)}
    )

    # set HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
        path="/api/v1/auth/refresh",
        samesite="lax",
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token, tags=["auth"])
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        login_id = payload.get("login_id")
        if user_id is None or login_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # optionally: verify login_id still exists…

    # issue new tokens
    access_token = create_access_token(
        {"sub": user_id, "login_id": login_id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    new_refresh = create_refresh_token({"sub": user_id, "login_id": login_id})
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
        path="/api/v1/auth/refresh",
        samesite="lax",
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout", status_code=204, tags=["auth"])
def logout(
    token: str = Depends(oauth2_scheme),
    response: Response = None,
    db: Session = Depends(get_db),
):
    from app.core.security import decode_access_token
    try:
        payload = decode_access_token(token)
        login_id = payload.get("login_id")
        if login_id:
            update_logout_time(db, int(login_id))
    except Exception:
        pass

    # clear refresh cookie
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")
    return Response(status_code=204)

@router.post("/request-password-reset", status_code=202, tags=["auth"])
def request_password_reset(data: PasswordResetRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    # don’t reveal existence
    if user:
        pr = create_password_reset_code(db, user.id)
        reset_link = (
            f"{settings.FRONTEND_URL}/reset-password?"
            f"code={pr.code}&email={user.email}"
        )
        # schedule the email send on FastAPI’s running loop
        background_tasks.add_task(
            send_password_reset_email,
            user.email,
            user.first_name,
            reset_link,
        )
    return {"msg": "If that email exists, a reset code has been sent"}

@router.post("/reset-password", status_code=200, tags=["auth"])
def reset_password_endpoint(data: PasswordResetVerify, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(404, "User not found")
    if not reset_password(db, user.id, data.code, data.new_password):
        raise HTTPException(400, "Invalid or expired code")
    return {"msg": "Password updated successfully"}