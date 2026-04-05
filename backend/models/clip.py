from pydantic import BaseModel

from models.color import ColorAnalysisResult
from models.quality import QualityResult


class CLIPAnalysisResult(BaseModel):
    similarity_score: float        # 0-100, image vs description match
    product_type_detected: str     # from zero-shot classification
    product_type_confidence: float # 0-100
    quality: QualityResult
    color: ColorAnalysisResult
    verdict: str                   # Approved / Catalog Only / Replace
    verdict_reason: str            # one sentence explaining the verdict
    model_used: str                # "CLIP ViT-B/32"
    processing_time_ms: float
