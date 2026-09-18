# FastAPI application entry point with routing, CORS, and scheduled cleanup
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import init_db, SessionLocal
from app.models.user import User
from app.api.auth import router as auth_router
from app.api.items import router as items_router
from app.api.ai import router as ai_router
from app.core.logger import logger

settings = get_settings()


async def purge_inactive_users():
    """Delete users who haven't logged in for 60+ days (data retention policy)."""
    async with SessionLocal() as db:
        try:
            logger.info("Starting purge_inactive_users background job")
            cutoff = datetime.now(timezone.utc) - timedelta(days=60)
            result = await db.execute(select(User).filter(User.last_login < cutoff))
            inactive = result.scalars().all()
            for user in inactive:
                logger.info(f"Purging inactive user: {user.id}")
                await db.delete(user)
            await db.commit()
            logger.info(f"Purged {len(inactive)} inactive users")
        except Exception as e:
            logger.error(f"Error purging inactive users: {e}")


scheduler = AsyncIOScheduler()
scheduler.add_job(purge_inactive_users, "cron", hour=3, minute=0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()
    logger.info("Starting background scheduler...")
    scheduler.start()
    logger.info("Application startup complete.")
    yield
    logger.info("Shutting down background scheduler...")
    scheduler.shutdown()
    logger.info("Application shutdown complete.")


app = FastAPI(
    title="Smart AI Wardrobe API",
    description="Digital wardrobe management with AI-powered outfit recommendations",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(items_router)
app.include_router(ai_router)


@app.get("/health")
def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok"}
