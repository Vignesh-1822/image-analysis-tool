from fastapi import FastAPI
from dotenv import load_dotenv

from routers import parser

load_dotenv()

app = FastAPI(title="Image Analysis Tool")

app.include_router(parser.router)


@app.get("/health")
def health():
    return {"status": "ok"}
