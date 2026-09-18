# Gemini AI service for outfit recommendations and purchase evaluation
import json
from google import genai
from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()
client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL = "gemini-3.5-flash-lite"


def build_inventory_context(items: list[dict]) -> str:
    if not items:
        return "The user's wardrobe is currently empty."
    lines = []
    for item in items:
        tags_str = ", ".join(item.get("tags", []))
        lines.append(f"- {item['category']} | Color: {item.get('color', 'N/A')} | Tags: {tags_str} | Status: {item['status']}")
    return "\n".join(lines)


def recommend_outfit(occasion: str, inventory: list[dict], weather: str = None, preferences: str = None) -> dict:
    logger.info(f"Generating outfit recommendation for occasion: {occasion}")
    inventory_text = build_inventory_context(inventory)
    weather_text = f"\nCurrent weather: {weather}" if weather else ""
    pref_text = f"\nUser preferences: {preferences}" if preferences else ""

    prompt = f"""You are a professional fashion stylist. Based on the user's available wardrobe, recommend a complete outfit.

OCCASION: {occasion}{weather_text}{pref_text}

AVAILABLE WARDROBE (only CLEAN items):
{inventory_text}

Respond in valid JSON with this structure:
{{
  "outfit": [
    {{"category": "top", "description": "the specific item from inventory"}},
    {{"category": "bottom", "description": "the specific item from inventory"}},
    ...
  ],
  "explanation": "Why this outfit works for the occasion",
  "styling_tips": "Additional styling advice"
}}

Only recommend items that exist in the wardrobe. If the wardrobe lacks items for a complete outfit, mention what's missing."""

    logger.info("Calling Gemini API for outfit recommendation")
    response = client.models.generate_content(model=MODEL, contents=prompt)
    logger.info("Received response from Gemini API")
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)


def evaluate_purchase(product_info: dict, inventory: list[dict]) -> dict:
    logger.info(f"Generating purchase evaluation for product: {product_info.get('name')}")
    inventory_text = build_inventory_context(inventory)

    prompt = f"""You are a smart wardrobe advisor. A user wants to buy a new item. Evaluate whether this purchase is a good addition to their existing wardrobe.

PRODUCT:
- Name: {product_info.get('name', 'Unknown')}
- Description: {product_info.get('description', 'N/A')}
- Category: {product_info.get('category', 'N/A')}

CURRENT WARDROBE:
{inventory_text}

Respond in valid JSON:
{{
  "versatility_score": <1-10 integer>,
  "redundancies": ["list of similar items they already own"],
  "recommendation": "Buy / Skip / Consider - with reasoning",
  "suggested_pairings": ["items from their wardrobe this would pair well with"]
}}"""

    logger.info("Calling Gemini API for purchase evaluation")
    response = client.models.generate_content(model=MODEL, contents=prompt)
    logger.info("Received response from Gemini API")
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)
