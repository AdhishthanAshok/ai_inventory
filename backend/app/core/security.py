# JWT token creation, password hashing, and auth dependencies
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt

from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from app.core.logger import logger

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


import hashlib

def _pre_hash(password: str) -> bytes:
    # Pre-hash to avoid bcrypt's 72-byte limit for long passwords
    return hashlib.sha256(password.encode('utf-8')).hexdigest().encode('utf-8')


def hash_password(password: str) -> str:
    pwd_bytes = _pre_hash(password)
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = _pre_hash(plain)
        hash_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except ValueError:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token decoding failed: missing 'sub' claim")
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"JWTError during token decode: {e}")
        raise credentials_exception

    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        logger.warning(f"User {user_id} not found in database during auth")
        raise credentials_exception

    # Update last_login on every authenticated request
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    return user
