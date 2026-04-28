from pydantic import BaseModel

from models.quality import QualityResult
from models.color import ColorAnalysisResult
from models.clip import CLIPAnalysisResult, ScoreComponent
from models.ai_model import AIModelAnalysisResult


class YoloScoreBreakdown(BaseModel):
    detection: ScoreComponent
    color_match: ScoreComponent | None = None
    image_quality: ScoreComponent


class YoloSamAnalysisResult(BaseModel):
    status: str
    object_detected: bool = False
    class_name: str | None = None
    confidence: float = 0.0
    mask_area_percent: float = 0.0

    # Full analysis fields (matching CLIP / AI tabs)
    composite_score: float = 0.0
    score_breakdown: YoloScoreBreakdown | None = None
    product_type_detected: str | None = None
    product_type_match: bool = False
    quality: QualityResult | None = None
    color: ColorAnalysisResult | None = None

    verdict: str = "REJECTED"
    verdict_note: str = ""
    model_used: str = "YOLOv8n + SAM2-B"
    processing_time_ms: float = 0.0


class CombinedAnalysisResult(BaseModel):
    item_number: str
    sku_id: str | None
    hierarchy: str | None
    primary_color: str | None
    long_description: str | None
    image_url: str | None
    segmented_image_base64: str | None = None
    clip: CLIPAnalysisResult
    ai: AIModelAnalysisResult
    yolo: YoloSamAnalysisResult
