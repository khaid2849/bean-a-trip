import uuid
from datetime import datetime

from pydantic import BaseModel


class BudgetItemCreate(BaseModel):
    category: str
    planned_amount: float


class BudgetItemUpdate(BaseModel):
    category: str | None = None
    planned_amount: float | None = None


class BudgetItemOut(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    category: str
    planned_amount: float
    created_at: datetime

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: str
    notes: str | None = None


class ExpenseUpdate(BaseModel):
    title: str | None = None
    amount: float | None = None
    category: str | None = None
    date: str | None = None
    notes: str | None = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    title: str
    amount: float
    category: str
    date: str
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CategorySummary(BaseModel):
    category: str
    planned: float
    spent: float
    remaining: float


class ExpenseSummary(BaseModel):
    total_budget: float
    total_spent: float
    remaining: float
    by_category: list[CategorySummary]


class ExpenseListResponse(BaseModel):
    budget_items: list[BudgetItemOut]
    expenses: list[ExpenseOut]
