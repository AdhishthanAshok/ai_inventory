# Beanie document model for the users collection
from datetime import datetime, timezone
import uuid

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: Indexed(str, unique=True)
    password_hash: str
    last_login: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
