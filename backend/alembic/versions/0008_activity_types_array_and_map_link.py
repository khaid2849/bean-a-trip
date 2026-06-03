"""activity types array and map link

Revision ID: 0008
Revises: 0007
Create Date: 2026-06-03
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ARRAY

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("activities", sa.Column("types", ARRAY(sa.Text()), nullable=True))
    op.execute("UPDATE activities SET types = ARRAY[type::text]")
    op.alter_column("activities", "types", nullable=False)
    op.add_column("activities", sa.Column("map_link", sa.String(), nullable=True))
    op.drop_column("activities", "type")
    op.execute("DROP TYPE IF EXISTS activitytype")


def downgrade() -> None:
    op.execute("CREATE TYPE activitytype AS ENUM ('activity', 'food', 'transport', 'accommodation', 'other')")
    op.add_column("activities", sa.Column("type", sa.Enum(name="activitytype"), nullable=True))
    op.execute("UPDATE activities SET type = (types[1])::activitytype")
    op.alter_column("activities", "type", nullable=False)
    op.drop_column("activities", "map_link")
    op.drop_column("activities", "types")
