from fastapi import APIRouter, Depends, status, Query, Body
from app.models.orm.product import (
    ProductCreate,
    ProductFilter,
    ProductSort,
    ProductPut,
    ProductPatch,
)
from app.services.product_service import get_product_service, ProductService
from app.utils.response import ResponseBuilder
from uuid import UUID
from pydantic import BaseModel


class StockUpdate(BaseModel):
    stock: int


class BulkDeleteRequest(BaseModel):
    ids: list[UUID]

product_router = APIRouter(prefix="/product", tags=["product"])


@product_router.post("", status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate, service: ProductService = Depends(get_product_service)
):
    result = service.create(product)
    return ResponseBuilder.success(
        data=result, message="Product created", status_code=201
    )


@product_router.get("")
def get_products(
    service: ProductService = Depends(get_product_service),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    filter: str = Query(
        None,
        description="Filtros: 'campo:operador:valor,campo2:operador:valor'.",
    ),
    sort: str = Query(
        None,
        description="Ordenamiento: 'campo:direccion,campo2:direccion'.",
    ),
):
    offset, limit = ResponseBuilder.get_pagination_params(page=page, page_size=size)
    filter_model = ProductFilter.from_string(filter)
    sort_model = ProductSort.from_string(sort)

    result = service.get_filtered(
        filter=filter_model, offset=offset, limit=limit, sort=sort_model
    )
    total = service.count(filter_model)

    return ResponseBuilder.paginated(
        data=result, page=page, size=size, total=total, message="Products list"
    )


@product_router.get("/search")
def search_products(
    q: str = Query(..., min_length=1, description="Texto a buscar en el nombre"),
    service: ProductService = Depends(get_product_service),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    offset, limit = ResponseBuilder.get_pagination_params(page=page, page_size=size)
    filter_model = ProductFilter.from_string(f"name:like:{q}")
    result = service.get_filtered(filter=filter_model, offset=offset, limit=limit)
    total = service.count(filter_model)
    return ResponseBuilder.paginated(
        data=result, page=page, size=size, total=total, message="Search results"
    )


@product_router.get("/count")
def count_products(
    filter: str = Query(None, description="Filtros opcionales"),
    service: ProductService = Depends(get_product_service),
):
    filter_model = ProductFilter.from_string(filter)
    total = service.count(filter_model)
    return ResponseBuilder.success(data={"count": total}, message="Product count")


@product_router.post("/bulk", status_code=status.HTTP_201_CREATED)
def bulk_create_products(
    products: list[ProductCreate] = Body(..., min_length=1),
    service: ProductService = Depends(get_product_service),
):
    created = [service.create(product) for product in products]
    return ResponseBuilder.success(
        data=created, message=f"{len(created)} products created"
    )


@product_router.delete("/bulk")
def bulk_delete_products(
    body: BulkDeleteRequest,
    service: ProductService = Depends(get_product_service),
):
    deleted_ids = []
    for product_id in body.ids:
        product = service.get_by_id(product_id)
        service.delete(product)
        deleted_ids.append(str(product_id))
    return ResponseBuilder.success(
        data={"deleted_ids": deleted_ids},
        message=f"{len(deleted_ids)} products deleted",
    )


@product_router.get("/{product_id}")
def get_product(
    product_id: UUID, service: ProductService = Depends(get_product_service)
):
    result = service.get_by_id(product_id)
    return ResponseBuilder.success(data=result, message="Product detail")


@product_router.delete("/{product_id}")
def delete_product(
    product_id: UUID, service: ProductService = Depends(get_product_service)
):
    product = service.get_by_id(product_id)
    service.delete(product)
    return ResponseBuilder.success(message="Product deleted")


@product_router.put("/{product_id}")
def update_hero_put(
    product_id: UUID,
    updated_product: ProductPut,
    service: ProductService = Depends(get_product_service),
):
    result = service.update_put(
        product_id, updated_product
    )
    return ResponseBuilder.success(data=result, message="Product updated (PUT)")


@product_router.patch("/{product_id}/stock")
def update_product_stock(
    product_id: UUID,
    body: StockUpdate,
    service: ProductService = Depends(get_product_service),
):
    result = service.update_patch(product_id, {"stock": body.stock})
    return ResponseBuilder.success(data=result, message="Stock updated")


@product_router.patch("/{product_id}")
def update_hero_patch(
    product_id: UUID,
    partial_update: ProductPatch,
    service: ProductService = Depends(get_product_service),
):
    update_dict = partial_update.model_dump(exclude_unset=True)
    result = service.update_patch(
        product_id, update_dict
    )
    return ResponseBuilder.success(data=result, message="Product updated (PATCH)")
