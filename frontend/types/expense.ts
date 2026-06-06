export const EXPENSE_CATEGORIES = ["Food", "Transport", "Accommodation", "Activities", "Shopping", "Other"] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface BudgetItem {
  id: string;
  trip_id: string;
  category: string;
  planned_amount: number;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface CategorySummary {
  category: string;
  planned: number;
  spent: number;
  remaining: number;
}

export interface ExpenseSummary {
  total_budget: number;
  total_spent: number;
  remaining: number;
  by_category: CategorySummary[];
}

export interface ExpenseListResponse {
  budget_items: BudgetItem[];
  expenses: Expense[];
}
