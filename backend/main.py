import logging
from contextlib import asynccontextmanager

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from strawberry.fastapi import GraphQLRouter

from gql.schema import schema
from routers import admin, ai_model, analyze, clip, color, parser, quality
from routers.auth import router as auth_router
from services.auth import decode_token
from services.clip import get_clip_model

load_dotenv()

from database import engine

logger = logging.getLogger("uvicorn")

# Paths that do NOT require authentication
_PUBLIC_PATHS = {"/health", "/auth/login"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_clip_model()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error("Database connection failed: %s", e)
    yield


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Image Analysis Tool", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def require_auth(request: Request, call_next):
    # Let preflight and public paths through without a token
    if request.method == "OPTIONS" or request.url.path in _PUBLIC_PATHS:
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

    token = auth_header[7:]
    if not decode_token(token):
        return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

    return await call_next(request)


graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

app.include_router(auth_router)
app.include_router(admin.router)
app.include_router(analyze.router)
app.include_router(parser.router)
app.include_router(quality.router)
app.include_router(color.router)
app.include_router(clip.router)
app.include_router(ai_model.router)


@app.get("/health")
def health():
    return {"status": "ok"}
