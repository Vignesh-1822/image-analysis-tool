from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.combined import CombinedAnalysisResult
from models.database_models import SKU
from services.ai_model import analyze_with_ai
from services.clip import analyze_with_clip
from services.image_downloader import download_image
from services.parser import parse_product_description

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze/{identifier}", response_model=CombinedAnalysisResult)
def analyze_by_identifier(
    identifier: str,
    db: Session = Depends(get_db),
) -> CombinedAnalysisResult:
    sku = db.query(SKU).filter(SKU.item_number == identifier).first()
    if not sku:
        sku = db.query(SKU).filter(SKU.sku_id == identifier).first()
    if not sku:
        raise HTTPException(status_code=404, detail=f"SKU '{identifier}' not found")

    image_bytes = download_image(sku.image_link)
    if image_bytes is None:
        raise HTTPException(status_code=422, detail="Image could not be downloaded from CDN URL")

    hierarchy = sku.hierarchy or "unknown product"
    primary_color = sku.primary_color
    long_description = sku.long_description or ""
    parsed = parse_product_description(long_description)

    clip_result = analyze_with_clip(
        image_bytes,
        hierarchy,
        primary_color=primary_color,
    )

    ai_result = analyze_with_ai(
        image_bytes,
        parsed.model_dump(),
        primary_color=primary_color,
        hierarchy=hierarchy,
        color_result=clip_result.color,
    )

    return CombinedAnalysisResult(
        item_number=sku.item_number,
        sku_id=sku.sku_id,
        hierarchy=sku.hierarchy,
        primary_color=sku.primary_color,
        image_url=sku.image_link,
        clip=clip_result,
        ai=ai_result,
    )
