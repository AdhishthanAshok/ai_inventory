# Background removal using rembg for clothing images
# Dependencies are lazily imported to allow the app to boot
# on platforms where rembg/onnxruntime are not installed.
from io import BytesIO
from app.core.logger import logger


def remove_background(image_bytes: bytes) -> bytes:
    """Remove the background from a clothing image using rembg.
    
    Raises ImportError if rembg or Pillow are not installed,
    which is expected in production (serverless) deployments.
    """
    # Lazy imports — these are heavy ML dependencies (~1.2GB RAM)
    # and are intentionally excluded from production requirements.txt
    try:
        from PIL import Image
        from rembg import remove
    except ImportError:
        logger.error("rembg/Pillow not installed — background removal unavailable")
        raise ImportError(
            "rembg and Pillow are required for background removal but are not installed. "
            "Install with: pip install -r requirements-dev.txt"
        )

    logger.info(f"Starting background removal (input size: {len(image_bytes)} bytes)")
    try:
        input_image = Image.open(BytesIO(image_bytes))
        output_image = remove(input_image)

        # Convert to RGBA PNG for transparent background
        output_buffer = BytesIO()
        output_image.save(output_buffer, format="PNG")
        output_buffer.seek(0)
        
        result_bytes = output_buffer.getvalue()
        logger.info(f"Background removal complete (output size: {len(result_bytes)} bytes)")
        return result_bytes
    except Exception as e:
        logger.error(f"Failed to remove background: {e}")
        raise
