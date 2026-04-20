from pydantic import BaseModel


class DominantColor(BaseModel):
    hex: str
    percentage: float
    color_name: str


class ColorComparisonResult(BaseModel):
    status: str  # matched / no_data / not_applicable / multicolored / transparent / unknown_color
    extracted_hex: str | None = None
    target_hex: str | None = None
    target_color_name: str | None = None
    delta_e: float | None = None
    match_score: float | None = None
    match_label: str | None = None
    resolution_method: str = "pim_lab"
    tolerance_used: float | None = None
    cluster_scores: list[dict] = []


class ColorAnalysisResult(BaseModel):
    dominant_colors: list[DominantColor]
    comparison: ColorComparisonResult | None = None
