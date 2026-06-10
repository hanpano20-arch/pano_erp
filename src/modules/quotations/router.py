import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.modules.quotations.domain.models import Quotation, QuotationItem
from src.modules.quotations.schemas import QuotationCreate, QuotationResponse

router = APIRouter()

# Fixed default Tenant ID for MVP
DEFAULT_TENANT_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

@router.get("/", response_model=list[QuotationResponse])
async def list_quotations(db: AsyncSession = Depends(get_db)):
    # 1. Fetch quotations
    query = select(Quotation).where(Quotation.deleted_at.is_(None)).order_by(Quotation.created_at.desc())
    result = await db.execute(query)
    quotations = list(result.scalars().all())
    
    if not quotations:
        return []
        
    # 2. Fetch items for these quotations
    quotation_ids = [q.id for q in quotations]
    items_query = select(QuotationItem).where(QuotationItem.quotation_id.in_(quotation_ids))
    items_result = await db.execute(items_query)
    all_items = list(items_result.scalars().all())
    
    # Map items to quotations
    items_by_quotation = {}
    for item in all_items:
        items_by_quotation.setdefault(item.quotation_id, []).append(item)
        
    for q in quotations:
        q.items = items_by_quotation.get(q.id, [])
        
    return quotations

@router.post("/", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
async def create_quotation(quotation_in: QuotationCreate, db: AsyncSession = Depends(get_db)):
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    quotation_id = uuid.uuid4()
    quotation = Quotation(
        id=quotation_id,
        tenant_id=DEFAULT_TENANT_ID,
        code=quotation_in.code,
        name=quotation_in.name,
        project_id=quotation_in.project_id,
        customer_id=quotation_in.customer_id,
        total_amount=quotation_in.total_amount,
        currency=quotation_in.currency,
        labor_cost=quotation_in.labor_cost,
        margin_percentage=quotation_in.margin_percentage,
        status=quotation_in.status,
        created_at=now,
        updated_at=now
    )
    db.add(quotation)
    
    # Save items
    items = []
    for item_in in quotation_in.items:
        item = QuotationItem(
            id=uuid.uuid4(),
            tenant_id=DEFAULT_TENANT_ID,
            quotation_id=quotation_id,
            product_id=item_in.product_id,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
            currency=item_in.currency,
            created_at=now,
            updated_at=now
        )
        db.add(item)
        items.append(item)
        
    await db.commit()
    await db.refresh(quotation)
    
    # Attach items so they are serialized correctly in response
    quotation.items = items
    return quotation

@router.delete("/{quotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quotation(quotation_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    import datetime
    query = select(Quotation).where(Quotation.id == quotation_id, Quotation.deleted_at.is_(None))
    result = await db.execute(query)
    quotation = result.scalars().first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    quotation.deleted_at = datetime.datetime.now(datetime.timezone.utc)
    await db.commit()
    return None
