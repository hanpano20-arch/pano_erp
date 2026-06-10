"""update_quotations_and_items

Revision ID: ab318b1074eb
Revises: 820b6014772f
Create Date: 2026-06-10 09:03:54.672912

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab318b1074eb'
down_revision: Union[str, Sequence[str], None] = '820b6014772f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the quotation_items table
    op.create_table('quotation_items',
        sa.Column('tenant_id', sa.Uuid(), nullable=False),
        sa.Column('quotation_id', sa.Uuid(), nullable=False),
        sa.Column('product_id', sa.Uuid(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('unit_price', sa.Numeric(precision=15, scale=4), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quotation_items_id'), 'quotation_items', ['id'], unique=False)

    # Use batch mode for SQLite ALTER TABLE operations
    with op.batch_alter_table('quotations') as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=300), nullable=False, server_default=''))
        batch_op.add_column(sa.Column('total_amount', sa.Numeric(precision=15, scale=4), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('currency', sa.String(length=3), nullable=False, server_default='TRY'))
        batch_op.add_column(sa.Column('labor_cost', sa.Numeric(precision=15, scale=4), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('margin_percentage', sa.Numeric(precision=5, scale=2), nullable=False, server_default='0'))
        batch_op.alter_column('project_id', existing_type=sa.Uuid(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('quotations') as batch_op:
        batch_op.alter_column('project_id', existing_type=sa.Uuid(), nullable=False)
        batch_op.drop_column('margin_percentage')
        batch_op.drop_column('labor_cost')
        batch_op.drop_column('currency')
        batch_op.drop_column('total_amount')
        batch_op.drop_column('name')
    op.drop_index(op.f('ix_quotation_items_id'), table_name='quotation_items')
    op.drop_table('quotation_items')
