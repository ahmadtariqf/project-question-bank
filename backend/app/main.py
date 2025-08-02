from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.api import api_router
from app.middleware.logging import LoggingMiddleware

app = FastAPI(title="QuizForge API")

app.add_middleware(LoggingMiddleware)
app.include_router(api_router, prefix="/api/v1")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)