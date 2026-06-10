import uuid
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class QuotationItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: Decimal = Field(default=Decimal("1.0"))
    unit_price: Decimal = Field(default=Decimal("0.0"))
    currency: str = Field(default="TRY", max_length=3)

class QuotationItemCreate(QuotationItemBase):
    pass

class QuotationItemResponse(QuotationItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    quotation_id: uuid.UUID

class QuotationBase(BaseModel):
    code: str = Field(..., max_length=30)
    name: str = Field(..., max_length=300)
    project_id: uuid.UUID | None = None
    customer_id: uuid.UUID
    total_amount: Decimal = Field(default=Decimal("0.0"))
    currency: str = Field(default="TRY", max_length=3)
    labor_cost: Decimal = Field(default=Decimal("0.0"))
    margin_percentage: Decimal = Field(default=Decimal("0.0"))
    status: str = Field(default="draft", max_length=20)

class QuotationCreate(QuotationBase):
    items: list[QuotationItemCreate] = Field(default_factory=list)

class QuotationUpdate(BaseModel):
    code: str | None = Field(None, max_length=30)
    name: str | None = Field(None, max_length=300)
    project_id: uuid.UUID | None = None
    customer_id: uuid.UUID | None = None
    total_amount: Decimal | None = None
    currency: str | None = Field(None, max_length=3)
    labor_cost: Decimal | None = None
    margin_percentage: Decimal | None = None
    status: str | None = Field(None, max_length=20)

class QuotationResponse(QuotationBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    items: list[QuotationItemResponse] = Field(default_factory=list)
