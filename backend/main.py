from fastapi import FastAPI
from dotenv import load_dotenv

from routers import parser, quality

load_dotenv()

app = FastAPI(title="Image Analysis Tool")

app.include_router(parser.router)
app.include_router(quality.router)


@app.get("/health")
def health():
    return {"status": "ok"}
