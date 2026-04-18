from fastapi import APIRouter, Form, HTTPException, UploadFile

from models.clip import CLIPAnalysisResult
from services.clip import analyze_with_clip
from services.parser import parse_product_description

router = APIRouter(prefix="/api", tags=["clip"])


@router.post("/analyze/clip", response_model=CLIPAnalysisResult)
async def analyze_clip(
    description: str = Form(...),
    file: UploadFile | None = None,
    image_url: str | None = Form(default=None),
    primary_color: str | None = Form(default=None),
) -> CLIPAnalysisResult:
    image_bytes = await file.read() if file else None
    parsed = parse_product_description(description)
    try:
        return analyze_with_clip(
            image_bytes,
            description,
            parsed,
            image_url=image_url,
            primary_color=primary_color,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
