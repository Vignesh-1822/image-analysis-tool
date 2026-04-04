from pydantic import BaseModel, Field


class BlurResult(BaseModel):
    score: float
    is_blurry: bool
    label: str  # Sharp / Slightly Blurry / Blurry


class ResolutionResult(BaseModel):
    width: int
    height: int
    is_sufficient: bool
    label: str  # 4K Native / High Res / Sufficient / Low Res


class FramingResult(BaseModel):
    centroid_offset: float = Field(description="0.0 = centered, 1.0 = at edge")
    is_centered: bool
    label: str  # Centered / Slightly Off / Off-Center


class QualityResult(BaseModel):
    blur: BlurResult
    resolution: ResolutionResult
    framing: FramingResult
    overall_score: float  # 0-100
    overall_label: str    # Excellent / Good / Fair / Poor
