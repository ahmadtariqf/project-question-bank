from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
import os
from jinja2 import Environment, FileSystemLoader, select_autoescape

# at the top of your mailer module
from pathlib import Path

# this file is e.g. backend/app/core/config.py or backend/app/mailer.py
BASE_DIR = Path(__file__).resolve().parent.parent  # -> backend/app
TEMPLATE_DIR = BASE_DIR / "templates"

# ensure it exists (optional)
TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)


conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS   = settings.MAIL_STARTTLS, 
    MAIL_SSL_TLS    = settings.MAIL_SSL_TLS, 
    USE_CREDENTIALS = settings.USE_CREDENTIALS,
    TEMPLATE_FOLDER = str(TEMPLATE_DIR), 
)

# set up Jinja environment
templates_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../templates"))
jinja_env = Environment(
    loader=FileSystemLoader(templates_path),
    autoescape=select_autoescape(["html", "xml"]),
)

fm = FastMail(conf)

async def send_verification_email(email: str, code: str, first_name:str, verify_link:str):

    # render the HTML template
    html_body = jinja_env.get_template("verification.html").render(
        first_name=first_name,
        code=code,
        verify_link=verify_link,
    )
    message = MessageSchema(
        subject="Verify Your QuizForge Email",
        recipients=[email],
        body=html_body,
        subtype="html",
    )
    await fm.send_message(message)

async def send_password_reset_email(email: str, first_name:str, reset_link:str):
    html_body = jinja_env.get_template("password_reset.html").render(
        first_name=first_name,
        reset_link=reset_link,
    )
    message = MessageSchema(
        subject="Reset Your QuizForge Password",
        recipients=[email],
        body=html_body,
        subtype="html",
    )
    await fm.send_message(message)
