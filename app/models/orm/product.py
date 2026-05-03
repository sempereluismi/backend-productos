from app.models.orm.base import BaseSQLModel
from app.models.mixins.sortable_mixin import SortableMixin
from app.models.mixins.filterable_mixin import FilterableMixin
from pydantic import BaseModel
from sqlmodel import Field
from typing import cast, Any


class Product(BaseSQLModel, SortableMixin, FilterableMixin, table=True):
    name: str = Field(index=True)
    description: str | None = None
    price: float = Field(index=True)
    stock: int = Field(default=0)


ProductFilterField, ProductFilter = cast(
    tuple[Any, type[BaseModel]],
    Product.create_filter_classes(exclude_fields={"created_at", "updated_at"}),
)

ProductSortField, ProductSort = Product.create_sort_classes()


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    stock: int = 0


class ProductPut(BaseModel):
    name: str
    description: str | None = None
    price: float
    stock: int


class ProductPatch(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
