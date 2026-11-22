# Beanie + Motor async database initialization
from motor.motor_asyncio import AsyncIOMotorClient
import beanie

from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global _client
    logger.info("Connecting to MongoDB and initializing Beanie...")
    try:
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
        # Deferred imports to avoid circular imports at module load time
        from app.models.user import User
        from app.models.item import Item
        await beanie.init_beanie(
            database=_client[settings.DATABASE_NAME],
            document_models=[User, Item],
        )
        logger.info("MongoDB connection and Beanie initialization successful")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB/Beanie: {e}")
        raise


async def close_db() -> None:
    global _client
    if _client is not None:
        logger.info("Closing MongoDB connection...")
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")
