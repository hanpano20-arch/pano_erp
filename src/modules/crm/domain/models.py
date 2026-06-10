import uuid
from sqlalchemy import Boolean, String, Text
from sqlalchemy.types import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.core.database import Base
from src.shared.models.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

class Customer(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "customers"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    company_name: Mapped[str] = mapped_column(String(300), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
