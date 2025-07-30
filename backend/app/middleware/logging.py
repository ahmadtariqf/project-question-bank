from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.request_log import RequestLog
from app.core.security import decode_access_token, JWTError

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        db: Session = SessionLocal()
        try:
            # attempt to extract user_id from Bearer token
            auth: str | None = request.headers.get("authorization")
            user_id = None
            if auth and auth.lower().startswith("bearer "):
                token = auth.split(" ", 1)[1]
                try:
                    payload = decode_access_token(token)
                    sub = payload.get("sub")
                    if sub:
                        user_id = int(sub)
                except JWTError:
                    pass

            log = RequestLog(
                path=request.url.path,
                method=request.method,
                status_code=response.status_code,
                user_id=user_id,
            )
            db.add(log)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

        return response
