from fastapi import APIRouter, Form, HTTPException, UploadFile

from models.color import ColorAnalysisResult
from services.color import analyze_image_color

router = APIRouter(prefix="/api", tags=["color"])


@router.post("/color", response_model=ColorAnalysisResult)
async def analyze_color(
    file: UploadFile,
    target_color: str | None = Form(default=None),
) -> ColorAnalysisResult:
    image_bytes = await file.read()
    try:
        return analyze_image_color(image_bytes, target_color_name=target_color)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
