from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import ai_model, clip, color, parser, quality
from services.clip import get_clip_model

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_clip_model()
    yield


app = FastAPI(title="Image Analysis Tool", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parser.router)
app.include_router(quality.router)
app.include_router(color.router)
app.include_router(clip.router)
app.include_router(ai_model.router)


@app.get("/health")
def health():
    return {"status": "ok"}
