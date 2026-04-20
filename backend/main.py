import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text

from strawberry.fastapi import GraphQLRouter

from gql.schema import schema
from routers import admin, ai_model, analyze, clip, color, parser, quality
from services.clip import get_clip_model

load_dotenv()

from database import engine

logger = logging.getLogger("uvicorn")


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


app = FastAPI(title="Image Analysis Tool", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

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
