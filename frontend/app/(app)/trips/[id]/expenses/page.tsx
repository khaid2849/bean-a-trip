"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Wallet, Settings, Pencil,
  UtensilsCrossed, Car, BedDouble, Zap, ShoppingBag, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoCard } from "@/components/bento/BentoCard";
import { BudgetChart } from "@/components/expenses/BudgetChart";
import { BudgetSetup } from "@/components/expenses/BudgetSetup";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { EditExpenseDialog } from "@/components/expenses/EditExpenseDialog";
import { useExpenses, useExpenseSummary, useCreateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types/expense";

type CategoryFilter = "All" | "Food" | "Transport" | "Accommodation" | "Activities" | "Shopping" | "Other";

const CATEGORY_CHIPS: { label: CategoryFilter; icon?: React.ComponentType<{ className?: string }> }[] = [
  { label: "All" },
  { label: "Food",          icon: UtensilsCrossed },
  { label: "Transport",     icon: Car },
  { label: "Accommodation", icon: BedDouble },
  { label: "Activities",    icon: Zap },
  { label: "Shopping",      icon: ShoppingBag },
  { label: "Other",         icon: Circle },
];

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Food:          UtensilsCrossed,
  Transport:     Car,
  Accommodation: BedDouble,
  Activities:    Zap,
  Shopping:      ShoppingBag,
  Other:         Circle,
};

const CATEGORY_ICON_STYLE: Record<string, string> = {
  Food:          "bg-terracotta-lt dark:bg-[#5A2318] text-terracotta dark:text-terracotta-lt",
  Transport:     "bg-asagi-lt dark:bg-[#102838] text-asagi dark:text-asagi-lt",
  Accommodation: "bg-kincha-lt dark:bg-[#4A2E08] text-kincha dark:text-kincha-lt",
  Activities:    "bg-fuji-lt dark:bg-[#3D2840] text-fuji dark:text-fuji-lt",
  Shopping:      "bg-matcha-lt dark:bg-[#1E3A1A] text-matcha dark:text-matcha-lt",
  Other:         "bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]",
};

const CATEGORY_BADGE: Record<string, string> = {
  Food:          "bg-terracotta-lt dark:bg-[#5A2318] text-terracotta-dk dark:text-terracotta-lt",
  Transport:     "bg-asagi-lt dark:bg-[#102838] text-asagi-dk dark:text-asagi-lt",
  Accommodation: "bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt",
  Activities:    "bg-fuji-lt dark:bg-[#3D2840] text-fuji-dk dark:text-fuji-lt",
  Shopping:      "bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt",
  Other:         "bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]",
};

function fmt(n: number) { return `$${Number(n).toFixed(2)}`; }

function formatDateHeader(date: string): string {
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const [, mm, dd] = date.split("-");
  return `${months[parseInt(mm) - 1]} ${dd}`;
}

export default function ExpensesPage({ params }: { params: { id: string } }) {
  const { id: tripId } = params;
  const { data, isLoading } = useExpenses(tripId);
  const { data: summary } = useExpenseSummary(tripId);
  const { mutateAsync: createExpense, isPending: isExpenseCreating } = useCreateExpense(tripId);
  const { mutateAsync: deleteExpense } = useDeleteExpense(tripId);

  const [addOpen, setAddOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const budgetItems = data?.budget_items ?? [];
  const expenses = data?.expenses ?? [];

  const filteredExpenses = useMemo(() => {
    if (activeCategory === "All") return expenses;
    return expenses.filter(e => e.category === activeCategory);
  }, [expenses, activeCategory]);

  const expensesByDate = useMemo(() =>
    filteredExpenses.reduce<Record<string, Expense[]>>((acc, e) => {
      (acc[e.date] = acc[e.date] ?? []).push(e);
      return acc;
    }, {})
  , [filteredExpenses]);

  const sortedDates = useMemo(() =>
    Object.keys(expensesByDate).sort((a, b) => b.localeCompare(a))
  , [expensesByDate]);

  const pct = summary && summary.total_budget > 0
    ? Math.min((summary.total_spent / summary.total_budget) * 100, 100)
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Expenses</h2>
            <p className="text-sm text-[var(--text-tertiary)]">{expenses.length} transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-matcha px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-matcha-mid"
            onClick={() => setBudgetOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" /> Budget
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-matcha px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-matcha-mid"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add expense
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Total Budget</p>
          <p className="mt-1 text-2xl font-medium text-[var(--text-primary)]">
            {summary && summary.total_budget > 0 ? fmt(summary.total_budget) : "—"}
          </p>
          {(!summary || summary.total_budget === 0) && (
            <button
              onClick={() => setBudgetOpen(true)}
              className="mt-1 text-xs text-matcha hover:underline"
            >
              Set budget →
            </button>
          )}
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Spent</p>
          <p className="mt-1 text-2xl font-medium text-terracotta">
            {summary ? fmt(summary.total_spent) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Remaining</p>
          {summary && summary.total_budget > 0 ? (
            <p className={cn("mt-1 text-2xl font-medium", summary.remaining >= 0 ? "text-matcha" : "text-[var(--text-danger)]")}>
              {summary.remaining < 0 ? "-" : ""}{fmt(Math.abs(summary.remaining))}
            </p>
          ) : (
            <p className="mt-1 text-2xl font-medium text-[var(--text-primary)]">—</p>
          )}
        </div>
      </div>

      {/* Overall progress bar */}
      {summary && summary.total_budget > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
            <div
              className={cn("h-full rounded-full transition-all", summary.remaining < 0 ? "bg-terracotta" : "bg-matcha")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-medium text-[var(--text-tertiary)]">
            {Math.round(pct)}%
          </span>
        </div>
      )}

      {/* Budget vs Actual + By Category */}
      {(summary?.by_category?.length ?? 0) > 0 && (
        <BentoGrid>
          <BentoCard size="md" title="Budget vs Actual">
            <BudgetChart data={summary?.by_category ?? []} />
          </BentoCard>
          <BentoCard size="md" title="By Category">
            <div className="space-y-3">
              {summary?.by_category.map(cat => {
                const catPct = cat.planned > 0 ? Math.min((cat.spent / cat.planned) * 100, 100) : 0;
                const catOver = cat.planned > 0 && cat.spent > cat.planned;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", CATEGORY_BADGE[cat.category] ?? CATEGORY_BADGE.Other)}>
                        {cat.category}
                      </span>
                      <div className="flex gap-4 text-right text-xs">
                        <span className="text-[var(--text-tertiary)]">plan: {fmt(cat.planned)}</span>
                        <span className={cn("font-medium", catOver ? "text-terracotta" : "text-[var(--text-primary)]")}>
                          {fmt(cat.spent)}
                        </span>
                      </div>
                    </div>
                    {cat.planned > 0 && (
                      <div className="h-1 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
                        <div
                          className={cn("h-full rounded-full transition-all", catOver ? "bg-terracotta" : "bg-matcha")}
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </BentoGrid>
      )}

      {/* Transactions */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Transactions
        </h3>

        {/* Category filter chips */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_CHIPS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                activeCategory === label
                  ? "border-matcha-mid bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-matcha-mid hover:text-matcha"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-washi-100 dark:bg-sumi-100" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Wallet className="h-10 w-10 text-[var(--text-tertiary)]" />
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--text-primary)]">No expenses yet</p>
              <p className="text-sm text-[var(--text-secondary)]">Start tracking your spending as you travel</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No {activeCategory.toLowerCase()} expenses found.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map(date => (
              <div key={date}>
                <p className="mb-2 py-1 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  {formatDateHeader(date)}
                </p>
                <div className="space-y-1.5">
                  {expensesByDate[date].map(expense => {
                    const CatIcon = CATEGORY_ICON[expense.category] ?? Circle;
                    const iconStyle = CATEGORY_ICON_STYLE[expense.category] ?? CATEGORY_ICON_STYLE.Other;
                    return (
                      <div
                        key={expense.id}
                        className="group flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 px-4 py-3 transition-colors hover:bg-washi-50 dark:hover:bg-sumi-50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconStyle)}>
                            <CatIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{expense.title}</p>
                            {expense.notes && (
                              <p className="truncate text-xs text-[var(--text-tertiary)]">{expense.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex shrink-0 items-center gap-2">
                          <span className="text-xs text-[var(--text-tertiary)]">{expense.date}</span>
                          <span className="text-sm font-medium text-[var(--text-primary)]">{fmt(expense.amount)}</span>
                          <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                              onClick={() => setEditExpense(expense)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-danger)]"
                              onClick={() => deleteExpense(expense.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
          <ExpenseForm
            onSubmit={async (data) => { await createExpense(data); setAddOpen(false); }}
            isLoading={isExpenseCreating}
          />
        </DialogContent>
      </Dialog>

      <EditExpenseDialog tripId={tripId} expense={editExpense} onClose={() => setEditExpense(null)} />

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Set budget by category</DialogTitle></DialogHeader>
          <BudgetSetup tripId={tripId} budgetItems={budgetItems} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
