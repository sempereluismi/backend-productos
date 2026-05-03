from app.exceptions.base import AppException
from uuid import UUID


class ProductNotFoundException(AppException):
    def __init__(self, product_id: UUID):
        super().__init__(
            f"Product with id {product_id} not found",
            status_code=404,
            error_code="PRODUCT_NOT_FOUND",
        )
