"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import type { BudgetItem } from "@/types/expense";

interface BudgetCategoryRowProps {
  tripId: string;
  category: string;
  existing?: BudgetItem;
}

function BudgetCategoryRow({ tripId, category, existing }: BudgetCategoryRowProps) {
  const [amount, setAmount] = useState(existing?.planned_amount?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  async function handleSave() {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    try {
      if (existing) {
        await api.put(`/trips/${tripId}/expenses/budget/${existing.id}`, { planned_amount: val });
      } else {
        await api.post(`/trips/${tripId}/expenses/budget`, { category, planned_amount: val });
      }
      qc.invalidateQueries({ queryKey: ["expenses", tripId] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm font-medium">{category}</span>
      <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount}
        onChange={e => setAmount(e.target.value)} className="flex-1" />
      <Button size="sm" className="bg-matcha hover:bg-matcha-mid text-white" onClick={handleSave} disabled={saving}>
        {saving ? "…" : "Save"}
      </Button>
    </div>
  );
}

interface BudgetSetupProps {
  tripId: string;
  budgetItems: BudgetItem[];
}

export function BudgetSetup({ tripId, budgetItems }: BudgetSetupProps) {
  const budgetByCategory = Object.fromEntries(budgetItems.map(b => [b.category, b]));
  return (
    <div className="space-y-3">
      {EXPENSE_CATEGORIES.map(cat => (
        <BudgetCategoryRow key={cat} tripId={tripId} category={cat} existing={budgetByCategory[cat]} />
      ))}
    </div>
  );
}
