"use client";

import { getIcon, ICON_GROUPS } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {ICON_GROUPS.map(group => (
        <div key={group.label}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1">
            {group.icons.map(name => {
              const Icon = getIcon(name);
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => onChange(name)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    value === name
                      ? "bg-terracotta text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-washi-100 dark:hover:bg-sumi-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
