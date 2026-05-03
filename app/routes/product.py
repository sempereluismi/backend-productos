from fastapi import APIRouter, Depends, status, Query
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
