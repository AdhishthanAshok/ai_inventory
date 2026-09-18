# AI API endpoints: outfit recommendation and purchase evaluation
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.item import Item
from app.models.user import User
from app.schemas.ai import (
    RecommendRequest, RecommendResponse,
    EvaluatePurchaseRequest, EvaluatePurchaseResponse,
)
from app.services.gemini_service import recommend_outfit, evaluate_purchase
from app.services.scraper import scrape_product_info
from app.core.logger import logger

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _items_to_dicts(items: list[Item]) -> list[dict]:
    return [
        {
            "category": item.category,
            "color": item.color,
            "tags": item.tags or [],
            "status": item.status,
        }
        for item in items
    ]


@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendation(
    payload: RecommendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Item).filter(
        Item.user_id == current_user.id,
        Item.status == "CLEAN",
    ))
    clean_items = result.scalars().all()

    if not clean_items:
        logger.warning(f"Recommendation failed: no clean items for user {current_user.id}")
        raise HTTPException(status_code=400, detail="No clean items in your wardrobe. Mark some items as clean first.")

    inventory = _items_to_dicts(clean_items)

    try:
        logger.info(f"Requesting outfit recommendation for user: {current_user.id}, occasion: {payload.occasion}")
        result = recommend_outfit(
            occasion=payload.occasion,
            inventory=inventory,
            weather=payload.weather,
            preferences=payload.preferences,
        )
        logger.info(f"Successfully generated outfit recommendation for user: {current_user.id}")
        return RecommendResponse(**result)
    except Exception as e:
        logger.error(f"AI recommendation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"AI recommendation failed: {str(e)}")


@router.post("/evaluate-purchase", response_model=EvaluatePurchaseResponse)
async def evaluate_purchase_endpoint(
    payload: EvaluatePurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Scrape product info from URL
    try:
        logger.info(f"Evaluating purchase for user: {current_user.id}, URL: {payload.product_url}")
        product_info = await scrape_product_info(payload.product_url)
    except Exception as e:
        logger.error(f"Failed to fetch product info: {e}")
        raise HTTPException(status_code=400, detail=f"Could not fetch product info: {str(e)}")

    # Get user's full inventory
    result = await db.execute(select(Item).filter(Item.user_id == current_user.id))
    all_items = result.scalars().all()
    inventory = _items_to_dicts(all_items)

    try:
        logger.info(f"Sending inventory and product to AI for evaluation for user: {current_user.id}")
        result = evaluate_purchase(product_info, inventory)
        result["product_name"] = product_info.get("name", "Unknown Product")
        result["product_image"] = product_info.get("image")
        logger.info(f"Successfully evaluated purchase for user: {current_user.id}")
        return EvaluatePurchaseResponse(**result)
    except Exception as e:
        logger.error(f"AI evaluation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {str(e)}")
