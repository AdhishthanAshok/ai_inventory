# Beanie document model for the items (clothing inventory) collection
from datetime import datetime, timezone
from typing import Optional
import uuid

from beanie import Document, Indexed
from pydantic import Field


class Item(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Indexed(str)
    image_url: str
    category: Optional[str] = None
    color: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    status: str = "CLEAN"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "items"
