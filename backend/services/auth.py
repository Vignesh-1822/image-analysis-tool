import os
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

_ALGORITHM = "HS256"


def _secret() -> str:
    return os.getenv("JWT_SECRET", "")


def _expire_hours() -> int:
    return int(os.getenv("JWT_EXPIRE_HOURS", "8"))


def verify_password(plain: str) -> bool:
    hashed = os.getenv("APP_PASSWORD_HASH", "")
    if not hashed:
        return False
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=_expire_hours())
    return jwt.encode({"exp": expire, "sub": "user"}, _secret(), algorithm=_ALGORITHM)


def decode_token(token: str) -> bool:
    secret = _secret()
    if not secret:
        return False
    try:
        jwt.decode(token, secret, algorithms=[_ALGORITHM])
        return True
    except JWTError:
        return False
