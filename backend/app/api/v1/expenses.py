import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.expense import BudgetItem, Expense
from app.schemas.expense import (
    BudgetItemCreate, BudgetItemOut, BudgetItemUpdate,
    CategorySummary, ExpenseCreate, ExpenseListResponse, ExpenseOut, ExpenseSummary, ExpenseUpdate,
)

router = APIRouter(prefix="/trips/{trip_id}/expenses", tags=["expenses"])


@router.get("", response_model=ExpenseListResponse)
def list_expenses(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    budget_items = db.query(BudgetItem).filter(BudgetItem.trip_id == trip_id).all()
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).order_by(Expense.date.desc()).all()
    return ExpenseListResponse(budget_items=budget_items, expenses=expenses)


@router.get("/summary", response_model=ExpenseSummary)
def expense_summary(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    budget_items = db.query(BudgetItem).filter(BudgetItem.trip_id == trip_id).all()
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()

    budget_by_cat: dict[str, float] = {b.category: float(b.planned_amount) for b in budget_items}
    spent_by_cat: dict[str, float] = defaultdict(float)
    for e in expenses:
        spent_by_cat[e.category] += float(e.amount)

    all_cats = set(budget_by_cat.keys()) | set(spent_by_cat.keys())
    by_category = [
        CategorySummary(
            category=cat,
            planned=budget_by_cat.get(cat, 0),
            spent=spent_by_cat.get(cat, 0),
            remaining=budget_by_cat.get(cat, 0) - spent_by_cat.get(cat, 0),
        )
        for cat in sorted(all_cats)
    ]

    total_budget = sum(budget_by_cat.values())
    total_spent = sum(spent_by_cat.values())
    return ExpenseSummary(
        total_budget=total_budget,
        total_spent=total_spent,
        remaining=total_budget - total_spent,
        by_category=by_category,
    )


@router.post("/budget", response_model=BudgetItemOut, status_code=status.HTTP_201_CREATED)
def create_budget_item(trip_id: uuid.UUID, body: BudgetItemCreate, db: Session = Depends(get_db)):
    item = BudgetItem(**body.model_dump(), trip_id=trip_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/budget/{item_id}", response_model=BudgetItemOut)
def update_budget_item(trip_id: uuid.UUID, item_id: uuid.UUID, body: BudgetItemUpdate, db: Session = Depends(get_db)):
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id, BudgetItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget item not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/budget/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_item(trip_id: uuid.UUID, item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id, BudgetItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget item not found")
    db.delete(item)
    db.commit()


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(trip_id: uuid.UUID, body: ExpenseCreate, db: Session = Depends(get_db)):
    expense = Expense(**body.model_dump(), trip_id=trip_id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(trip_id: uuid.UUID, expense_id: uuid.UUID, body: ExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.trip_id == trip_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(trip_id: uuid.UUID, expense_id: uuid.UUID, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.trip_id == trip_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    db.delete(expense)
    db.commit()
