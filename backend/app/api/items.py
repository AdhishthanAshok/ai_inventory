# Items API endpoints: CRUD operations, image upload, status toggle
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status

from app.core.security import get_current_user
from app.models.item import Item
from app.models.user import User
from app.schemas.item import ItemResponse, ItemUpdate, ItemStatusUpdate
# NOTE: remove_background is lazily imported inside the upload route handler
# to avoid crashing the app when rembg/onnxruntime are not installed (production).
from app.utils.cloudinary_upload import upload_image, delete_image, extract_public_id
from app.core.logger import logger

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("/", response_model=list[ItemResponse])
async def list_items(
    status_filter: str = None,
    category: str = None,
    current_user: User = Depends(get_current_user),
):
    logger.info(f"Listing items for user: {current_user.id}, status_filter={status_filter}, category={category}")
    query: dict = {"user_id": str(current_user.id)}
    if status_filter:
        query["status"] = status_filter.upper()
    if category:
        query["category"] = category.lower()
    return await Item.find(query).sort("-created_at").to_list()


@router.post("/upload", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_item(
    file: UploadFile = File(...),
    category: str = Form(...),
    color: str = Form(None),
    tags: str = Form("[]"),
    current_user: User = Depends(get_current_user),
):
    logger.info(f"Uploading new item for user: {current_user.id}, category={category}")
    if not file.content_type.startswith("image/"):
        logger.warning("Upload failed: file is not an image")
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    # Lazy import: remove_background depends on rembg/onnxruntime which
    # are excluded from production requirements.txt (too heavy for serverless).
    try:
        from app.utils.image_processor import remove_background
        processed_bytes = remove_background(image_bytes)
    except ImportError:
        logger.warning("Upload blocked: rembg not installed in this environment")
        raise HTTPException(
            status_code=501,
            detail="Item digitization and background removal is paused on the live demo. Please use pre-loaded items.",
        )

    # Upload to Cloudinary
    image_url = upload_image(processed_bytes, folder=f"wardrobe/{current_user.id}")

    # Parse tags from JSON string
    import json
    try:
        parsed_tags = json.loads(tags) if tags else []
    except json.JSONDecodeError:
        parsed_tags = []

    item = Item(
        user_id=str(current_user.id),
        image_url=image_url,
        category=category.lower(),
        color=color.lower() if color else None,
        tags=parsed_tags,
    )
    await item.insert()
    logger.info(f"Item {item.id} successfully created and uploaded for user: {current_user.id}")
    return item


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
):
    item = await Item.find_one(Item.id == str(item_id), Item.user_id == str(current_user.id))
    if not item:
        logger.warning(f"Item not found or unauthorized access attempt: {item_id} by user {current_user.id}")
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: UUID,
    payload: ItemUpdate,
    current_user: User = Depends(get_current_user),
):
    item = await Item.find_one(Item.id == str(item_id), Item.user_id == str(current_user.id))
    if not item:
        logger.warning(f"Update failed: item not found or unauthorized: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    await item.save()
    return item


@router.patch("/{item_id}/status", response_model=ItemResponse)
async def update_item_status(
    item_id: UUID,
    payload: ItemStatusUpdate,
    current_user: User = Depends(get_current_user),
):
    item = await Item.find_one(Item.id == str(item_id), Item.user_id == str(current_user.id))
    if not item:
        logger.warning(f"Status update failed: item not found or unauthorized: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")

    item.status = payload.status
    await item.save()
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
):
    item = await Item.find_one(Item.id == str(item_id), Item.user_id == str(current_user.id))
    if not item:
        logger.warning(f"Delete failed: item not found or unauthorized: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")

    logger.info(f"Deleting item {item_id} for user {current_user.id}")

    # Delete image from Cloudinary
    public_id = extract_public_id(item.image_url)
    if public_id:
        delete_image(public_id)

    await item.delete()
