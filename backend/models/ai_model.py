from pydantic import BaseModel

from models.clip import ScoreComponent
from models.color import ColorAnalysisResult
from models.quality import QualityResult


class AIScoreBreakdown(BaseModel):
    ai_analysis: ScoreComponent
    color_match: ScoreComponent | None = None
    image_quality: ScoreComponent


class AIModelAnalysisResult(BaseModel):
    composite_score: float
    score_breakdown: AIScoreBreakdown

    # From GPT response
    product_type_match: bool
    product_type_detected: str
    color_match: bool
    color_detected: str
    texture_match: bool
    texture_detected: str
    is_correct_product: bool
    overall_match_score: float
    reasoning: str
    issues: list[str]

    # Shared with CLIP tab
    quality: QualityResult
    color: ColorAnalysisResult

    verdict: str              # Approved / Catalog Only / Replace
    verdict_reason: str
    verdict_note: str

    model_used: str           # "gpt-4o-mini"
    processing_time_ms: float
