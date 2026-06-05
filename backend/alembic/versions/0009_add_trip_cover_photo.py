"""add trip cover photo

Revision ID: 0009
Revises: 0008
Create Date: 2026-06-05
"""

import sqlalchemy as sa
from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("cover_photo_key", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("trips", "cover_photo_key")
