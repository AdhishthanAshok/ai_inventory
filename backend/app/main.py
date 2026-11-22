# FastAPI application entry point with routing, CORS, and scheduled cleanup
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.models.user import User
from app.api.auth import router as auth_router
from app.api.items import router as items_router
from app.api.ai import router as ai_router
from app.core.logger import logger

settings = get_settings()


async def purge_inactive_users():
    """Delete users who haven't logged in for 60+ days (data retention policy)."""
    try:
        logger.info("Starting purge_inactive_users background job")
        cutoff = datetime.now(timezone.utc) - timedelta(days=60)
        result = await User.find(User.last_login < cutoff).delete()
        deleted_count = result.deleted_count if result else 0
        logger.info(f"Purged {deleted_count} inactive users")
    except Exception as e:
        logger.error(f"Error purging inactive users: {e}")


scheduler = AsyncIOScheduler()
scheduler.add_job(purge_inactive_users, "cron", hour=3, minute=0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()

    # In serverless environments like Vercel, the in-process cron scheduler cannot
    # run background tasks between requests. Only run scheduler if not on Vercel.
    is_vercel = os.getenv("VERCEL") == "1"
    if not is_vercel:
        try:
            logger.info("Starting background scheduler...")
            scheduler.start()
        except Exception as e:
            logger.warning(f"Could not start background scheduler: {e}")

    logger.info("Application startup complete.")
    yield

    if scheduler.running:
        logger.info("Shutting down background scheduler...")
        scheduler.shutdown()

    await close_db()
    logger.info("Application shutdown complete.")


app = FastAPI(
    title="Smart AI Wardrobe API",
    description="Digital wardrobe management with AI-powered outfit recommendations",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [origin.strip().rstrip("/") for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if settings.FRONTEND_URL and settings.FRONTEND_URL.strip().rstrip("/") not in origins:
    origins.append(settings.FRONTEND_URL.strip().rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(items_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "name": "Smart AI Wardrobe API",
        "version": "1.0.0",
        "status": "online",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok"}


@app.api_route("/api/cron/purge-inactive-users", methods=["GET", "POST"])
async def cron_purge_inactive_users():
    """Triggered by Vercel Cron or manual request to purge inactive users."""
    await purge_inactive_users()
    return {"status": "ok", "message": "Purged inactive users"}
