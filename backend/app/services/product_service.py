from fastapi import Depends
from sqlmodel import Session
from app.repositories.product_repository import ProductRepository
from app.db.database import db
from app.models.orm.product import (
    Product,
    ProductFilter,
    ProductSort,
    ProductCreate,
    ProductPut,
    ProductPatch,
)
from app.exceptions.product import ProductNotFoundException
from app.services.base_service import BaseService


class ProductService(
    BaseService[
        Product,
        ProductFilter,
        ProductSort,
        ProductCreate,
        ProductPut,
        ProductPatch,
        ProductNotFoundException,
    ]
):
    def __init__(self, repository: ProductRepository):
        super().__init__(
            repository=repository,
            not_found_exception=ProductNotFoundException,
            model_class=Product,
        )


def get_product_service(session: Session = Depends(db.get_session)) -> ProductService:
    repo = ProductRepository(session)
    return ProductService(repo)
