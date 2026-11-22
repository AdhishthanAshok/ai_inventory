# Auth API endpoints: register and login
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.logger import logger

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    logger.info(f"Registering new user with username: {payload.username}")
    existing = await User.find_one(User.username == payload.username)
    if existing:
        logger.warning(f"Registration failed: username {payload.username} already taken")
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    await user.insert()

    token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"User registered successfully: {user.id}")
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    logger.info(f"Login attempt for username: {payload.username}")
    user = await User.find_one(User.username == payload.username)
    if not user or not verify_password(payload.password, user.password_hash):
        logger.warning(f"Login failed for username: {payload.username}")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"Login successful for user: {user.id}")
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
