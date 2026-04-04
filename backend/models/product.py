from typing import Optional, List
from pydantic import BaseModel, Field


class ParsedDescription(BaseModel):
    brand: Optional[str] = None
    product_line: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    product_type: str = "unknown"
    quantity_info: Optional[str] = None
    quantity_info_note: str = "Not relevant for image analysis"
