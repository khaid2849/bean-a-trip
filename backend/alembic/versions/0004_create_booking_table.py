"""create booking table

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-03
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bookings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", UUID(as_uuid=True), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.Enum("flight", "hotel", "bus", "train", "ferry", "other", name="bookingtype", create_type=True), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("confirmation_number", sa.String(), nullable=True),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("check_in", sa.String(), nullable=True),
        sa.Column("check_out", sa.String(), nullable=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("confirmed", "pending", "cancelled", name="bookingstatus", create_type=True), nullable=False, server_default="confirmed"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("bookings")
    op.execute("DROP TYPE IF EXISTS bookingtype")
    op.execute("DROP TYPE IF EXISTS bookingstatus")
