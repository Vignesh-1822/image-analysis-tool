import strawberry

from .resolvers import (
    get_failed_validations,
    get_sku,
    get_skus_by_color,
    get_skus_by_hierarchy,
)
from .types import AnalysisResultType, SKUType


@strawberry.type
class Query:
    @strawberry.field
    def sku(self, identifier: str) -> SKUType | None:
        return get_sku(identifier)

    @strawberry.field
    def skus_by_hierarchy(self, hierarchy: str) -> list[SKUType]:
        return get_skus_by_hierarchy(hierarchy)

    @strawberry.field
    def skus_by_color(self, primary_color: str) -> list[SKUType]:
        return get_skus_by_color(primary_color)

    @strawberry.field
    def failed_validations(self) -> list[AnalysisResultType]:
        return get_failed_validations()


schema = strawberry.Schema(query=Query)
