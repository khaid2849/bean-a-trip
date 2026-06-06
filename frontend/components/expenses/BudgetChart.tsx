"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import type { CategorySummary } from "@/types/expense";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-white dark:bg-sumi-100 px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-[var(--text-primary)]">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ${Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

interface BudgetChartProps {
  data: CategorySummary[];
}

export function BudgetChart({ data }: BudgetChartProps) {
  const chartData = data.filter(d => d.planned > 0 || d.spent > 0).map(d => ({
    category: d.category.slice(0, 5),
    Budget: Number(d.planned.toFixed(2)),
    Spent: Number(d.spent.toFixed(2)),
    isOver: d.spent > d.planned && d.planned > 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[var(--text-tertiary)]">
        No budget data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} barSize={18} barGap={4}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E4DDD2" />
        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#9E8E7A" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9E8E7A" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Budget" fill="#C2D9BC" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.isOver ? "#B5451E" : "#C0533A"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
