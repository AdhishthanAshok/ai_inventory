# SQLAlchemy async engine, session factory, and Base declarative class
import ssl
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()

connect_args = {}
if settings.ENVIRONMENT == "production":
    # Create a secure SSL context for asyncpg in production (like Aiven)
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

# Use create_async_engine for asyncpg
engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)
Base = declarative_base()


async def get_db():
    async with SessionLocal() as session:
        yield session


async def init_db():
    logger.info("Creating database tables if they do not exist")
    from app.models.user import User
    from app.models.item import Item
    try:
        # Use run_sync to run metadata creation asynchronously
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise