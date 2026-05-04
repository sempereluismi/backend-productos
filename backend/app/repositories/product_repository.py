from sqlmodel import Session
from app.models.orm.product import Product, ProductFilter, ProductSort
from app.repositories.base_repository import BaseRepository
from app.repositories.strategies.generic_filter_strategy import GenericFilterStrategy
from app.repositories.strategies.generic_sort_strategy import GenericSortStrategy


class ProductRepository(BaseRepository[Product, ProductFilter, ProductSort]):
    def __init__(self, session: Session):
        filter_strategy = GenericFilterStrategy(Product)
        sort_strategy = GenericSortStrategy(model_class=Product, default_sort="name")
        super().__init__(session, Product, filter_strategy, sort_strategy)
