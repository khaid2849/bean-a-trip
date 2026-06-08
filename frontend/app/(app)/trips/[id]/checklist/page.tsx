"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChecklist, useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from "@/hooks/useChecklist";
import { CHECKLIST_CATEGORIES } from "@/types/checklist";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/types/checklist";

const CATEGORY_COLOR: Record<string, string> = {
  Packing:     "text-terracotta",
  Documents:   "text-asagi",
  Preparation: "text-kincha",
  Other:       "text-[var(--text-secondary)]",
};

function CategorySection({ tripId, category, items }: { tripId: string; category: string; items: ChecklistItem[] }) {
  const [newTitle, setNewTitle] = useState("");
  const { mutateAsync: createItem, isPending: isCreating } = useCreateChecklistItem(tripId);
  const { mutateAsync: updateItem } = useUpdateChecklistItem(tripId);
  const { mutateAsync: deleteItem } = useDeleteChecklistItem(tripId);
  const inputRef = useRef<HTMLInputElement>(null);

  const checked = items.filter(i => i.is_checked).length;
  const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createItem({ title: newTitle.trim(), category });
    setNewTitle("");
    inputRef.current?.focus();
  }

  async function markAll() {
    await Promise.all(items.filter(i => !i.is_checked).map(i => updateItem({ id: i.id, is_checked: true })));
  }

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-medium text-sm", CATEGORY_COLOR[category] ?? "text-[var(--text-secondary)]")}>
            {category}
          </h3>
          <span className="rounded-full bg-washi-100 dark:bg-sumi-50 px-2 py-0.5 text-xs text-[var(--text-tertiary)]">
            {checked}/{items.length}
          </span>
        </div>
        {items.length > 0 && checked < items.length && (
          <button onClick={markAll} className="text-xs text-fuji hover:underline">Mark all done</button>
        )}
      </div>

      {/* Per-category progress bar */}
      {items.length > 0 && (
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
          <div className="h-full rounded-full bg-fuji transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="mb-3 space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="group flex items-center gap-2.5">
            <button
              onClick={() => updateItem({ id: item.id, is_checked: !item.is_checked })}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                item.is_checked
                  ? "border-fuji bg-fuji text-white"
                  : "border-[var(--border-hover)] hover:border-fuji"
              )}
            >
              {item.is_checked && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={cn(
              "flex-1 text-sm",
              item.is_checked ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
            )}>
              {item.title}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-[var(--text-danger)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-[var(--text-tertiary)]">No items yet</p>}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder={`Add to ${category.toLowerCase()}…`}
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="h-8 text-sm"
        />
        <button
          type="submit"
          disabled={isCreating || !newTitle.trim()}
          className="flex items-center justify-center rounded-md px-2 text-sm text-fuji transition-colors hover:bg-fuji-lt dark:hover:bg-[#3D2840] disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

export default function ChecklistPage({ params }: { params: { id: string } }) {
  const { id: tripId } = params;
  const { data: items = [], isLoading } = useChecklist(tripId);

  const totalChecked = items.filter(i => i.is_checked).length;
  const progress = items.length > 0 ? Math.round((totalChecked / items.length) * 100) : 0;

  const byCategory = Object.fromEntries(
    CHECKLIST_CATEGORIES.map(cat => [cat, items.filter(i => i.category === cat)])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Checklist</h2>
            <p className="text-sm text-[var(--text-tertiary)]">{totalChecked} of {items.length} done</p>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      {items.length > 0 && (
        <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Overall progress</span>
            <span className="text-sm font-medium text-fuji">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
            <div className="h-full rounded-full bg-fuji transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-washi-100 dark:bg-sumi-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CHECKLIST_CATEGORIES.map(cat => (
            <CategorySection key={cat} tripId={tripId} category={cat} items={byCategory[cat] ?? []} />
          ))}
        </div>
      )}

      {items.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-hover)] py-12 text-center">
          <CheckSquare className="h-8 w-8 text-[var(--text-tertiary)]" />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Use the input fields above each category to add items.</p>
        </div>
      )}
    </div>
  );
}
