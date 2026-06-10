import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.modules.crm.domain.models import Customer
from src.modules.crm.schemas import CustomerCreate, CustomerResponse, CustomerUpdate

router = APIRouter()

# Fixed default Tenant ID for MVP
DEFAULT_TENANT_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

async def seed_customers_if_empty(db: AsyncSession):
    # Check if we already have customers
    query = select(Customer).where(Customer.deleted_at.is_(None))
    result = await db.execute(query)
    existing = result.scalars().first()
    
    if existing:
        return
        
    # Seed data
    demo_customers = [
        Customer(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CUST-SIEMENS",
            company_name="Siemens Sanayi ve Ticaret A.Ş.",
            is_active=True
        ),
        Customer(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CUST-ABB",
            company_name="ABB Elektrik Sanayi A.Ş.",
            is_active=True
        ),
        Customer(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CUST-SCHNEIDER",
            company_name="Schneider Elektrik A.Ş.",
            is_active=True
        ),
        Customer(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CUST-GAMA",
            company_name="Gama Enerji A.Ş.",
            is_active=True
        ),
        Customer(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CUST-PANOTEK",
            company_name="Pano-Tek Mühendislik",
            is_active=True
        ),
        Customer(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CUST-AKDENIZ",
            company_name="Akdeniz Elektrik Dağıtım A.Ş.",
            is_active=True
        )
    ]
    
    db.add_all(demo_customers)
    await db.commit()

@router.get("/", response_model=list[CustomerResponse])
async def list_customers(db: AsyncSession = Depends(get_db)):
    await seed_customers_if_empty(db)
    query = select(Customer).where(Customer.deleted_at.is_(None)).order_by(Customer.company_name)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(customer_in: CustomerCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate code
    dup_query = select(Customer).where(Customer.code == customer_in.code, Customer.deleted_at.is_(None))
    dup_result = await db.execute(dup_query)
    if dup_result.scalars().first():
        raise HTTPException(status_code=400, detail="Customer with this code already exists")

    customer = Customer(
        tenant_id=DEFAULT_TENANT_ID,
        code=customer_in.code,
        company_name=customer_in.company_name,
        is_active=customer_in.is_active
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: uuid.UUID, customer_in: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Customer).where(Customer.id == customer_id, Customer.deleted_at.is_(None))
    result = await db.execute(query)
    customer = result.scalars().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    await db.commit()
    await db.refresh(customer)
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    import datetime
    query = select(Customer).where(Customer.id == customer_id, Customer.deleted_at.is_(None))
    result = await db.execute(query)
    customer = result.scalars().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.deleted_at = datetime.datetime.now(datetime.timezone.utc)
    await db.commit()
    return None
