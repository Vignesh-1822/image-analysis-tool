from fastapi import APIRouter
from pydantic import BaseModel

from models.product import ParsedDescription
from services.parser import parse_product_description

router = APIRouter(prefix="/api", tags=["parser"])


class DescriptionRequest(BaseModel):
    description: str


@router.post("/parse-description", response_model=ParsedDescription)
def parse_description(body: DescriptionRequest) -> ParsedDescription:
    return parse_product_description(body.description)
