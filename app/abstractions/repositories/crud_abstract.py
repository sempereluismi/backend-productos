from abc import ABC, abstractmethod
from typing import Generic, TypeVar
from uuid import UUID

T = TypeVar("T")
F = TypeVar("F")
S = TypeVar("S")
P = TypeVar("P")


class ReadableRepository(ABC, Generic[T, S]):
    @abstractmethod
    def get_by_id(self, obj_id: int) -> T | None:
        pass

    @abstractmethod
    def get_all(
        self, offset: int = 0, limit: int = 100, sort: S | None = None
    ) -> list[T]:
        pass


class WritableRepository(ABC, Generic[T, P]):
    @abstractmethod
    def create(self, obj: T) -> T:
        pass

    @abstractmethod
    def update_put(self, id: UUID, obj: T) -> T:
        pass

    @abstractmethod
    def update_patch(self, id: UUID, obj: P) -> T:
        pass

    @abstractmethod
    def delete(self, obj: T):
        pass


class FilterableRepository(ABC, Generic[T, F]):
    @abstractmethod
    def get_filtered(
        self, filter: F, offset: int = 0, limit: int = 100, sort: S | None = None
    ) -> list[T]:
        pass

    @abstractmethod
    def count(self, filter: F):
        pass


# Interfaz combinada para casos que necesiten todas las operaciones CRUD
class CRUDRepository(
    ReadableRepository[T, S],
    WritableRepository[T, P],
    FilterableRepository[T, F],
    ABC,
    Generic[T, F, S, P],
):
    pass
