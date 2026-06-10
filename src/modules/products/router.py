import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.modules.products.domain.models import Product
from src.modules.products.schemas import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter()

# Fixed default Tenant ID for MVP
DEFAULT_TENANT_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

async def seed_products_if_empty(db: AsyncSession):
    # Check if we already have products
    query = select(Product).where(Product.deleted_at.is_(None))
    result = await db.execute(query)
    existing = result.scalars().first()
    
    if existing:
        return
        
    # Seed data
    demo_products = [
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="3VA1225-4EF32",
            name="Molded Case Circuit Breaker (MCCB) 3P 250A 36kA",
            list_price=Decimal("185.00"),
            currency="EUR",
            is_active=True
        ),
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="5SY4110-7",
            name="Miniature Circuit Breaker (MCB) 1P 10A B Curve",
            list_price=Decimal("6.40"),
            currency="EUR",
            is_active=True
        ),
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CU-Bara-4010",
            name="Electrolytic Copper Busbar 40x10mm (E-Cu)",
            list_price=Decimal("840.00"),
            currency="TRY",
            is_active=True
        ),
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="WDU-4-10200",
            name="Weidmüller Feed-Through Terminal Block 4mm² Gray",
            list_price=Decimal("14.20"),
            currency="TRY",
            is_active=True
        ),
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="PANO-1008030",
            name="Steel Sheet Panel Enclosure IP66 1000x800x300mm",
            list_price=Decimal("5120.00"),
            currency="TRY",
            is_active=True
        ),
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="CT-400-5A",
            name="Current Transformer 400/5A Class 0.5 5VA",
            list_price=Decimal("450.00"),
            currency="TRY",
            is_active=True
        ),
        Product(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            code="3RT2026-1AP00",
            name="Siemens Sirius Contactor 3P 11kW 25A 230VAC",
            list_price=Decimal("52.00"),
            currency="EUR",
            is_active=True
        )
    ]
    
    db.add_all(demo_products)
    await db.commit()

@router.get("/", response_model=list[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    await seed_products_if_empty(db)
    query = select(Product).where(Product.deleted_at.is_(None)).order_by(Product.code)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate code
    dup_query = select(Product).where(Product.code == product_in.code, Product.deleted_at.is_(None))
    dup_result = await db.execute(dup_query)
    if dup_result.scalars().first():
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    product = Product(
        tenant_id=DEFAULT_TENANT_ID,
        code=product_in.code,
        name=product_in.name,
        brand_id=product_in.brand_id,
        list_price=product_in.list_price,
        currency=product_in.currency,
        is_active=product_in.is_active
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: uuid.UUID, product_in: ProductUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    import datetime
    query = select(Product).where(Product.id == product_id, Product.deleted_at.is_(None))
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.deleted_at = datetime.datetime.now(datetime.timezone.utc)
    await db.commit()
    return None
