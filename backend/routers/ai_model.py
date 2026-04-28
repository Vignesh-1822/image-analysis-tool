from fastapi import APIRouter, Form, HTTPException, UploadFile

from models.ai_model import AIModelAnalysisResult
from services.ai_model import analyze_with_ai
from services.parser import parse_product_description

router = APIRouter(prefix="/api", tags=["ai-model"])


@router.post("/analyze/ai-model", response_model=AIModelAnalysisResult)
async def analyze_ai_model(
    description: str = Form(...),
    hierarchy: str | None = Form(default=None),
    file: UploadFile | None = None,
    image_url: str | None = Form(default=None),
    primary_color: str | None = Form(default=None),
) -> AIModelAnalysisResult:
    image_bytes = await file.read() if file else None
    parsed = parse_product_description(description)
    try:
        return analyze_with_ai(
            image_bytes,
            parsed.model_dump(),
            image_url=image_url,
            primary_color=primary_color,
            hierarchy=hierarchy,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
