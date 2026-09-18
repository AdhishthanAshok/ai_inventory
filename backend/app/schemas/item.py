# Pydantic schemas for clothing item requests/responses
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class ItemCreate(BaseModel):
    category: str = Field(..., max_length=50)
    color: Optional[str] = Field(None, max_length=30)
    tags: list[str] = Field(default_factory=list)


class ItemUpdate(BaseModel):
    category: Optional[str] = None
    color: Optional[str] = None
    tags: Optional[list[str]] = None
    status: Optional[str] = None


class ItemResponse(BaseModel):
    id: UUID
    image_url: str
    category: str
    color: Optional[str]
    tags: list[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ItemStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(CLEAN|WORN|LAUNDRY)$")
