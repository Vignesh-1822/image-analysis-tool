"""
Quality router — receives the uploaded file, delegates to the service, returns the result.

WHY NO LOGIC HERE?
  Route handlers are the HTTP boundary layer. Their only job is to translate
  an HTTP request into Python values and an HTTP response. Putting analysis
  logic here would make it untestable without a running HTTP server and would
  couple business rules to FastAPI's request/response lifecycle. Keeping all
  logic in services/quality.py means it can be called directly from tests,
  CLI scripts, or other services without any web-framework involvement.
"""

from fastapi import APIRouter, HTTPException, UploadFile

from models.quality import QualityResult
from services.quality import analyze_image_quality

router = APIRouter(prefix="/api", tags=["quality"])


@router.post("/quality", response_model=QualityResult)
async def check_quality(file: UploadFile) -> QualityResult:
    image_bytes = await file.read()
    try:
        return analyze_image_quality(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
