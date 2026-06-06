"""loosen booking and place type columns to plain string

Revision ID: 0010
Revises: 0009
Create Date: 2026-06-06
"""
from alembic import op

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE bookings ALTER COLUMN type DROP DEFAULT")
    op.execute(
        "ALTER TABLE bookings ALTER COLUMN type TYPE VARCHAR USING type::text"
    )
    op.execute("DROP TYPE IF EXISTS bookingtype CASCADE")

    op.execute("ALTER TABLE places ALTER COLUMN type DROP DEFAULT")
    op.execute(
        "ALTER TABLE places ALTER COLUMN type TYPE VARCHAR USING type::text"
    )
    op.execute("ALTER TABLE places ALTER COLUMN type SET DEFAULT 'attraction'")
    op.execute("DROP TYPE IF EXISTS placetype CASCADE")


def downgrade() -> None:
    op.execute(
        "CREATE TYPE bookingtype AS ENUM ('flight','hotel','bus','train','ferry','other')"
    )
    op.execute(
        "ALTER TABLE bookings ALTER COLUMN type TYPE bookingtype USING type::bookingtype"
    )

    op.execute(
        "CREATE TYPE placetype AS ENUM ('attraction','restaurant','hotel','cafe','shopping','other')"
    )
    op.execute(
        "ALTER TABLE places ALTER COLUMN type TYPE placetype USING type::placetype"
    )
