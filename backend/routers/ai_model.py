from fastapi import APIRouter, Form, HTTPException, UploadFile

from models.ai_model import AIModelAnalysisResult
from services.ai_model import analyze_with_ai
from services.parser import parse_product_description

router = APIRouter(prefix="/api", tags=["ai-model"])


@router.post("/analyze/ai-model", response_model=AIModelAnalysisResult)
async def analyze_ai_model(
    file: UploadFile,
    description: str = Form(...),
) -> AIModelAnalysisResult:
    image_bytes = await file.read()
    parsed = parse_product_description(description)
    try:
        return analyze_with_ai(image_bytes, parsed.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
