"""add trip currency

Revision ID: 0012
Revises: 0011
Create Date: 2026-06-09
"""

import sqlalchemy as sa
from alembic import op

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("currency", sa.String(), nullable=False, server_default="VND"))


def downgrade() -> None:
    op.drop_column("trips", "currency")
