from datetime import datetime

from pydantic import BaseModel


class InsertSKURequest(BaseModel):
    light_data: dict
    full_data: dict


class AnalysisResultResponse(BaseModel):
    id: int
    sku_id: str | None
    item_number: str | None
    product_name: str | None
    composite_score: float | None
    verdict: str | None
    score_breakdown: dict | None
    verdict_note: str | None
    triggered_by: str | None
    created_at: datetime | None

    class Config:
        from_attributes = True
