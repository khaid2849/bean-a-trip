"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { IconPicker } from "./IconPicker";
import { getIcon } from "@/lib/icon-registry";
import { makeId } from "@/lib/settings-store";
import { cn } from "@/lib/utils";
import type { ConfigItem } from "@/lib/settings-store";

interface TypeManagerProps {
  items: ConfigItem[];
  onChange: (items: ConfigItem[]) => void;
  hasDescription?: boolean;
  accentClass?: string;
}

interface FormState {
  name: string;
  icon: string;
  description: string;
}

const EMPTY_FORM: FormState = { name: "", icon: "Circle", description: "" };

export function TypeManager({
  items,
  onChange,
  hasDescription = false,
  accentClass = "bg-terracotta text-white hover:bg-terracotta-mid",
}: TypeManagerProps) {
  const [addOpen,  setAddOpen]  = useState(false);
  const [editItem, setEditItem] = useState<ConfigItem | null>(null);
  const [form,     setForm]     = useState<FormState>(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  }

  function openEdit(item: ConfigItem) {
    setForm({ name: item.name, icon: item.icon, description: item.description ?? "" });
    setEditItem(item);
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    const id = makeId(form.name, items.map(i => i.id));
    onChange([
      ...items,
      { id, name: form.name.trim(), icon: form.icon, description: form.description || undefined },
    ]);
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editItem || !form.name.trim()) return;
    onChange(
      items.map(i =>
        i.id === editItem.id
          ? { ...i, name: form.name.trim(), icon: form.icon, description: form.description || undefined }
          : i
      )
    );
    setEditItem(null);
  }

  function handleDelete(id: string) {
    onChange(items.filter(i => i.id !== id));
  }

  return (
    <div>
      {/* List */}
      <div className="space-y-1.5">
        {items.map(item => {
          const Icon = getIcon(item.icon);
          return (
            <div
              key={item.id}
              className="group flex items-center gap-3 rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 px-3 py-2.5 transition-colors hover:border-[var(--border-hover)]"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-60" />

              {/* Icon badge */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-washi-100 dark:bg-sumi-50">
                <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>

              {/* Name + description */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                {item.description && (
                  <p className="truncate text-xs text-[var(--text-tertiary)]">{item.description}</p>
                )}
                <p className="text-[10px] font-mono text-[var(--text-tertiary)] opacity-60">{item.id}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--text-tertiary)] hover:text-red-500"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--border-hover)] py-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No types configured</p>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={openAdd}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-hover)] py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-terracotta hover:text-terracotta"
      >
        <Plus className="h-4 w-4" /> Add new
      </button>

      {/* Add dialog */}
      <TypeFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add type"
        form={form}
        setForm={setForm}
        hasDescription={hasDescription}
        onConfirm={handleAdd}
        confirmLabel="Add"
        accentClass={accentClass}
      />

      {/* Edit dialog */}
      <TypeFormDialog
        open={!!editItem}
        onOpenChange={open => { if (!open) setEditItem(null); }}
        title="Edit type"
        form={form}
        setForm={setForm}
        hasDescription={hasDescription}
        onConfirm={handleEdit}
        confirmLabel="Save"
        accentClass={accentClass}
      />
    </div>
  );
}

function TypeFormDialog({
  open, onOpenChange, title, form, setForm, hasDescription, onConfirm, confirmLabel, accentClass,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  form: FormState;
  setForm: (f: FormState) => void;
  hasDescription: boolean;
  onConfirm: () => void;
  confirmLabel: string;
  accentClass: string;
}) {
  const PreviewIcon = getIcon(form.icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 rounded-xl bg-washi-50 dark:bg-sumi-50 border border-[var(--border-default)] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-washi-100 dark:bg-sumi-100">
              <PreviewIcon className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {form.name || <span className="text-[var(--text-tertiary)]">Type name</span>}
            </span>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Museum Visit"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={e => { if (e.key === "Enter") onConfirm(); }}
              autoFocus
            />
          </div>

          {/* Description (activity types only) */}
          {hasDescription && (
            <div className="space-y-1.5">
              <Label>Description <span className="text-[var(--text-tertiary)]">(optional)</span></Label>
              <Input
                placeholder="Short description…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          )}

          {/* Icon picker */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="rounded-xl border border-[var(--border-default)] p-3">
              <IconPicker value={form.icon} onChange={icon => setForm({ ...form, icon })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!form.name.trim()}
            onClick={onConfirm}
            className={cn(accentClass)}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
