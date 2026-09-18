# Pydantic schemas for AI recommendation and purchase evaluation
from pydantic import BaseModel, Field
from typing import Optional


class RecommendRequest(BaseModel):
    occasion: str = Field(..., min_length=2, max_length=200)
    weather: Optional[str] = None
    preferences: Optional[str] = None


class RecommendResponse(BaseModel):
    outfit: list[dict]
    explanation: str
    styling_tips: Optional[str] = None


class EvaluatePurchaseRequest(BaseModel):
    product_url: str


class EvaluatePurchaseResponse(BaseModel):
    product_name: str
    product_image: Optional[str]
    versatility_score: int = Field(..., ge=1, le=10)
    redundancies: list[str]
    recommendation: str
    suggested_pairings: list[str]
