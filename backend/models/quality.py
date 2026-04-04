from pydantic import BaseModel, Field


class BlurResult(BaseModel):
    score: float = Field(description="Raw Laplacian variance value — higher means sharper")
    is_blurry: bool = Field(description="True if score is below the sharp threshold of 100")
    label: str = Field(description="Sharp / Slightly Blurry / Blurry")


class ResolutionResult(BaseModel):
    width: int = Field(description="Image width in pixels")
    height: int = Field(description="Image height in pixels")
    is_sufficient: bool = Field(description="True if both dimensions are at least 800px")
    label: str = Field(description="4K Native / High Res / Sufficient / Low Res")


class FramingResult(BaseModel):
    centroid_offset: float = Field(
        description="Normalized offset from center — 0.0 = perfectly centered, 1.0 = at edge"
    )
    is_centered: bool = Field(description="True if offset is below 0.30")
    label: str = Field(description="Centered / Slightly Off / Off-Center")


class QualityResult(BaseModel):
    blur: BlurResult
    resolution: ResolutionResult
    framing: FramingResult
    overall_score: float = Field(description="Composite quality score from 0 to 100")
    overall_label: str = Field(description="Excellent / Good / Fair / Poor")
