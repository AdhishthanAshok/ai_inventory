# Cloudinary upload utility for clothing images
import cloudinary
import cloudinary.uploader
from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_image(image_bytes: bytes, folder: str = "wardrobe") -> str:
    logger.info(f"Uploading image to Cloudinary (folder: {folder}, size: {len(image_bytes)} bytes)")
    try:
        result = cloudinary.uploader.upload(
            image_bytes,
            folder=folder,
            resource_type="image",
            format="png",
        )
        logger.info(f"Successfully uploaded image to Cloudinary: {result['secure_url']}")
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Failed to upload image to Cloudinary: {e}")
        raise


def delete_image(public_id: str) -> bool:
    logger.info(f"Deleting image from Cloudinary (public_id: {public_id})")
    try:
        result = cloudinary.uploader.destroy(public_id)
        success = result.get("result") == "ok"
        logger.info(f"Cloudinary deletion result: {success}")
        return success
    except Exception as e:
        logger.error(f"Failed to delete image from Cloudinary: {e}")
        return False


def extract_public_id(url: str) -> str:
    # Extract public_id from Cloudinary URL for deletion
    parts = url.split("/upload/")
    if len(parts) == 2:
        path = parts[1]
        # Remove version prefix if present (e.g., v1234567890/)
        if path.startswith("v") and "/" in path:
            path = path.split("/", 1)[1]
        # Remove file extension
        return path.rsplit(".", 1)[0]
    return ""
