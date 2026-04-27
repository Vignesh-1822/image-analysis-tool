from pydantic import BaseModel

from models.ai_model import AIModelAnalysisResult
from models.clip import CLIPAnalysisResult


class CombinedAnalysisResult(BaseModel):
    item_number: str
    sku_id: str | None
    hierarchy: str | None
    primary_color: str | None
    long_description: str | None
    image_url: str | None
    clip: CLIPAnalysisResult
    ai: AIModelAnalysisResult
