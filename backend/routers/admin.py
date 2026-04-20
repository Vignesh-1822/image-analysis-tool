from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AnalysisResultResponse, InsertSKURequest
from models.database_models import AnalysisResult, SKU

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/insert-sku", status_code=201)
def insert_sku(request: InsertSKURequest, db: Session = Depends(get_db)):
    try:
        light = request.light_data
        full = request.full_data

        item_number = light["ItemNumber"]
        sku_id = full.get("Id")
        long_description = light.get("LongDescription")
        primary_color = full.get("Attributes", {}).get("ATT_Primary_Color")
        marketing_color = full.get("Attributes", {}).get("ATT_Mfg_Color_Name")
        hierarchy = light.get("HierarchyId")
        taxonomy_path = full.get("Attributes", {}).get("TaxonomyPath")
        image_link = light.get("PrimaryImageLink")

        existing = db.query(SKU).filter(SKU.item_number == item_number).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail={"error": "Product already exists", "item_number": item_number},
            )

        sku = SKU(
            item_number=item_number,
            sku_id=sku_id,
            long_description=long_description,
            primary_color=primary_color,
            marketing_color=marketing_color,
            hierarchy=hierarchy,
            taxonomy_path=taxonomy_path,
            image_link=image_link,
            light_data=light,
            full_data=full,
        )
        db.add(sku)
        db.commit()

        return {
            "message": "Product inserted successfully",
            "item_number": item_number,
            "sku_id": sku_id,
            "primary_color": primary_color,
            "hierarchy": hierarchy,
            "image_link": image_link,
        }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail={"error": str(exc)}) from exc


@router.get("/failed-validations", response_model=list[AnalysisResultResponse])
def failed_validations(db: Session = Depends(get_db)):
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.verdict.in_(["Catalog Only", "Replace"]))
        .order_by(AnalysisResult.created_at.desc())
        .all()
    )
