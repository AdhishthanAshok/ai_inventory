# Web scraper to extract product info from shopping links using OG/meta tags
import httpx
from bs4 import BeautifulSoup
from app.core.logger import logger


async def scrape_product_info(url: str) -> dict:
    logger.info(f"Scraping product info from URL: {url}")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            logger.debug(f"Sending GET request to {url}")
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            logger.debug(f"Received response with status: {response.status_code}")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred while scraping: {e}")
        raise

    soup = BeautifulSoup(response.text, "html.parser")

    def get_meta(property_name: str) -> str:
        tag = soup.find("meta", attrs={"property": property_name}) or \
              soup.find("meta", attrs={"name": property_name})
        return tag.get("content", "").strip() if tag else ""

    name = get_meta("og:title") or (soup.title.string.strip() if soup.title else "Unknown Product")
    description = get_meta("og:description") or get_meta("description")
    image = get_meta("og:image")
    price = get_meta("product:price:amount") or get_meta("og:price:amount")

    result = {
        "name": name,
        "description": description,
        "image": image,
        "price": price,
        "url": url,
        "category": _guess_category(name + " " + description),
    }
    logger.info(f"Successfully scraped product: {name}")
    return result


def _guess_category(text: str) -> str:
    text_lower = text.lower()
    categories = {
        "top": ["shirt", "tee", "t-shirt", "blouse", "polo", "sweater", "hoodie", "jacket", "top", "kurta"],
        "bottom": ["jeans", "pants", "trousers", "shorts", "skirt", "chinos", "joggers"],
        "footwear": ["shoes", "sneakers", "boots", "sandals", "loafers", "heels"],
        "accessory": ["watch", "belt", "bag", "cap", "hat", "sunglasses", "scarf", "tie", "wallet"],
    }
    for cat, keywords in categories.items():
        if any(kw in text_lower for kw in keywords):
            return cat
    return "other"
