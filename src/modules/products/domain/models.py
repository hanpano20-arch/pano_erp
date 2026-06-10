import uuid
from sqlalchemy import Boolean, Numeric, String, Text
from sqlalchemy.types import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.core.database import Base
from src.shared.models.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

class Brand(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "brands"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Product(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "products"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    brand_id: Mapped[uuid.UUID | None] = mapped_column(UUID)
    list_price: Mapped[float] = mapped_column(Numeric(15, 4), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="TRY")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
