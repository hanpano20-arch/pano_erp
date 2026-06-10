import uuid
from sqlalchemy import Boolean, String, Text
from sqlalchemy.types import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.core.database import Base
from src.shared.models.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

class Project(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "projects"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft")
