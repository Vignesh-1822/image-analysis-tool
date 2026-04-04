from pydantic import BaseModel, Field


class DominantColor(BaseModel):
    hex: str
    percentage: float  # e.g. 0.65 = 65% of pixels
    color_name: str


class ColorComparisonResult(BaseModel):
    extracted_hex: str
    target_hex: str
    target_color_name: str
    delta_e: float = Field(description="Perceptual color difference — lower is better")
    match_score: float  # 0-100
    match_label: str    # Excellent / Good / Fair / Poor


class ColorAnalysisResult(BaseModel):
    dominant_colors: list[DominantColor]
    comparison: ColorComparisonResult | None = None
