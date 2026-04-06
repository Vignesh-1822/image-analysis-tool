from pydantic import BaseModel, Field


class DominantColor(BaseModel):
    hex: str
    percentage: float
    color_name: str


class ColorComparisonResult(BaseModel):
    extracted_hex: str
    target_hex: str | None = None
    target_color_name: str
    delta_e: float | None = Field(default=None, description="CIEDE2000 delta E of closest cluster")
    match_score: float | None = None   # 0-100 weighted final score
    match_label: str                   # Excellent / Good / Fair / Poor / Very Poor
    resolution_method: str             # always "semantic_lab"
    parsed_color: dict                 # output of parse_color_text
    tolerance_used: float
    cluster_scores: list[dict]         # per-cluster breakdown
    expected_category: str
    num_variations: int
    clusters_filtered: int


class ColorAnalysisResult(BaseModel):
    dominant_colors: list[DominantColor]
    comparison: ColorComparisonResult | None = None
