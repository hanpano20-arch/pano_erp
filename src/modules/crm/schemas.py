import uuid
from pydantic import BaseModel, ConfigDict, Field

class CustomerBase(BaseModel):
    code: str = Field(..., max_length=20)
    company_name: str = Field(..., max_length=300)
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    code: str | None = Field(None, max_length=20)
    company_name: str | None = Field(None, max_length=300)
    is_active: bool | None = None

class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
