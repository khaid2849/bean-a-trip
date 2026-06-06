"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";
import { getIcon } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types/expense";

interface ExpenseFormProps {
  defaultValues?: Partial<Expense>;
  onSubmit: (data: { title: string; amount: number; category: string; date: string; notes?: string }) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ExpenseForm({ defaultValues, onSubmit, isLoading, submitLabel = "Add expense" }: ExpenseFormProps) {
  const { settings } = useSettings();
  const categories = settings.expenseCategories;

  const [title,    setTitle]    = useState(defaultValues?.title ?? "");
  const [amount,   setAmount]   = useState(defaultValues?.amount?.toString() ?? "");
  const [category, setCategory] = useState(defaultValues?.category ?? categories[0]?.id ?? "Food");
  const [date,     setDate]     = useState(defaultValues?.date ?? new Date().toISOString().split("T")[0]);
  const [notes,    setNotes]    = useState(defaultValues?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, amount: parseFloat(amount), category, date, notes: notes || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input placeholder="e.g. Ramen dinner" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Amount</Label>
          <Input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => {
            const Icon = getIcon(c.icon);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c.id
                    ? "border-matcha bg-matcha text-white"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-matcha-mid hover:text-matcha"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes <span className="text-[var(--text-tertiary)]">(optional)</span></Label>
        <Input placeholder="Any notes…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <Button type="submit" className="w-full bg-matcha hover:bg-matcha-mid text-white font-medium" disabled={isLoading}>
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
