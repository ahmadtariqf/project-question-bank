from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI


from app.api import api_router
from app.middleware.logging import LoggingMiddleware

app = FastAPI(title="QuizForge API")

app.add_middleware(LoggingMiddleware)
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to QuizForge API"}

