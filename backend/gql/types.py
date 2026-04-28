import strawberry


@strawberry.type
class SKUType:
    id: int
    item_number: str
    sku_id: str | None
    long_description: str | None
    primary_color: str | None
    marketing_color: str | None
    hierarchy: str | None
    taxonomy_path: str | None
    image_link: str | None
    created_at: str | None


@strawberry.type
class AnalysisResultType:
    id: int
    sku_id: str | None
    item_number: str | None
    product_name: str | None
    composite_score: float | None
    verdict: str | None
    verdict_note: str | None
    triggered_by: str | None
    created_at: str | None
