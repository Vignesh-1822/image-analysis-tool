from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Image Analysis Tool")


@app.get("/health")
def health():
    return {"status": "ok"}
