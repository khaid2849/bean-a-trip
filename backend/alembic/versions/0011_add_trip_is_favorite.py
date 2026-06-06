"""add trip is_favorite

Revision ID: 0011
Revises: 0010
Create Date: 2026-06-06
"""

import sqlalchemy as sa
from alembic import op

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("is_favorite", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("trips", "is_favorite")
