from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import clip, color, parser, quality

load_dotenv()

app = FastAPI(title="Image Analysis Tool")

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


@app.get("/health")
def health():
    return {"status": "ok"}
