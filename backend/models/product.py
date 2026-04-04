from pydantic import BaseModel, Field


class ParsedDescription(BaseModel):
    brand: str | None = None
    product_line: str | None = None
    color: str | None = None
    style: str | None = None
    features: list[str] = Field(default_factory=list)
    product_type: str = "unknown"
    quantity_info: str | None = None
    quantity_info_note: str = "Not relevant for image analysis"
