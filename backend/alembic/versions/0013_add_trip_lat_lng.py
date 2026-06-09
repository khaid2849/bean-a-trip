"""add trip lat lng

Revision ID: 0013
Revises: 0012
Create Date: 2026-06-09
"""

import sqlalchemy as sa
from alembic import op

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("lat", sa.Float(), nullable=True))
    op.add_column("trips", sa.Column("lng", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("trips", "lat")
    op.drop_column("trips", "lng")
