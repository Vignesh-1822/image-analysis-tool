from database import SessionLocal
from models.database_models import AnalysisResult, SKU

from .types import AnalysisResultType, SKUType


def _sku_to_type(sku: SKU) -> SKUType:
    return SKUType(
        id=sku.id,
        item_number=sku.item_number,
        sku_id=sku.sku_id,
        long_description=sku.long_description,
        primary_color=sku.primary_color,
        marketing_color=sku.marketing_color,
        hierarchy=sku.hierarchy,
        taxonomy_path=sku.taxonomy_path,
        image_link=sku.image_link,
        created_at=sku.created_at.isoformat() if sku.created_at else None,
    )


def _result_to_type(result: AnalysisResult) -> AnalysisResultType:
    return AnalysisResultType(
        id=result.id,
        sku_id=result.sku_id,
        item_number=result.item_number,
        product_name=result.product_name,
        composite_score=result.composite_score,
        verdict=result.verdict,
        verdict_note=result.verdict_note,
        triggered_by=result.triggered_by,
        created_at=result.created_at.isoformat() if result.created_at else None,
    )


def get_sku(identifier: str) -> SKUType | None:
    db = SessionLocal()
    try:
        sku = db.query(SKU).filter(SKU.item_number == identifier).first()
        if not sku:
            sku = db.query(SKU).filter(SKU.sku_id == identifier).first()
        return _sku_to_type(sku) if sku else None
    finally:
        db.close()


def get_skus_by_hierarchy(hierarchy: str) -> list[SKUType]:
    db = SessionLocal()
    try:
        skus = db.query(SKU).filter(SKU.hierarchy == hierarchy).all()
        return [_sku_to_type(s) for s in skus]
    finally:
        db.close()


def get_skus_by_color(primary_color: str) -> list[SKUType]:
    db = SessionLocal()
    try:
        skus = db.query(SKU).filter(SKU.primary_color == primary_color).all()
        return [_sku_to_type(s) for s in skus]
    finally:
        db.close()


def get_failed_validations() -> list[AnalysisResultType]:
    db = SessionLocal()
    try:
        results = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.verdict.in_(["Catalog Only", "Replace"]))
            .order_by(AnalysisResult.created_at.desc())
            .all()
        )
        return [_result_to_type(r) for r in results]
    finally:
        db.close()
