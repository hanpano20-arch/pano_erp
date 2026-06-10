import uuid
from sqlalchemy import Boolean, String, Text, Numeric
from sqlalchemy.types import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.core.database import Base
from src.shared.models.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

class Quotation(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "quotations"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID, nullable=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0)
    currency: Mapped[str] = mapped_column(String(3), default="TRY")
    labor_cost: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0)
    margin_percentage: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="draft")

class QuotationItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quotation_items"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    quotation_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), default=1.0)
    unit_price: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0)
    currency: Mapped[str] = mapped_column(String(3), default="TRY")
