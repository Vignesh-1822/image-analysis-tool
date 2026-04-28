from pydantic import BaseModel

from models.color import ColorAnalysisResult
from models.quality import QualityResult


class ScoreComponent(BaseModel):
    score: float
    weight: float
    contribution: float


class ScoreBreakdown(BaseModel):
    product_type: ScoreComponent | None = None
    color_match: ScoreComponent | None = None
    image_quality: ScoreComponent | None = None


class CLIPAnalysisResult(BaseModel):
    composite_score: float           # main confidence ring number (0-100)
    score_breakdown: ScoreBreakdown
    product_type_detected: str
    product_type_match: bool
    quality: QualityResult | None = None
    color: ColorAnalysisResult | None = None
    verdict: str                     # Approved / Catalog Only / Replace
    verdict_note: str
    model_used: str
    processing_time_ms: float
