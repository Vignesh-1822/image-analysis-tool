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
