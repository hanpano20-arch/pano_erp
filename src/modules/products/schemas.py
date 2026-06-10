import uuid
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class ProductBase(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=300)
    brand_id: uuid.UUID | None = None
    list_price: Decimal = Field(default=Decimal("0.0"))
    currency: str = Field(default="TRY", max_length=3)
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    code: str | None = Field(None, max_length=50)
    name: str | None = Field(None, max_length=300)
    brand_id: uuid.UUID | None = None
    list_price: Decimal | None = None
    currency: str | None = Field(None, max_length=3)
    is_active: bool | None = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
