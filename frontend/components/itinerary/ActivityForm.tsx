"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";
import { getIcon } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import type { Activity, ActivityCreate, ActivityStatus } from "@/types/itinerary";

interface ActivityFormProps {
  defaultValues?: Partial<Activity>;
  onSubmit: (data: ActivityCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ActivityForm({ defaultValues, onSubmit, isLoading, submitLabel = "Add activity" }: ActivityFormProps) {
  const { settings } = useSettings();
  const types = settings.activityTypes;

  const [title,     setTitle]     = useState(defaultValues?.title ?? "");
  const [selected,  setSelected]  = useState<string[]>(defaultValues?.types ?? [types[0]?.id ?? "activity"]);
  const [startTime, setStartTime] = useState(defaultValues?.start_time ?? "");
  const [endTime,   setEndTime]   = useState(defaultValues?.end_time ?? "");
  const [mapLink,   setMapLink]   = useState(defaultValues?.map_link ?? "");
  const [notes,     setNotes]     = useState(defaultValues?.notes ?? "");
  const [status,    setStatus]    = useState<ActivityStatus>(defaultValues?.status ?? "planned");

  function toggleType(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(x => x !== id) : prev
        : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title,
      types: selected,
      start_time: startTime || undefined,
      end_time:   endTime   || undefined,
      map_link:   mapLink   || undefined,
      notes:      notes     || undefined,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Activity name</Label>
        <Input placeholder="e.g. Visit Senso-ji Temple" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Type <span className="text-muted-foreground text-xs">(select multiple)</span></Label>
        <div className="flex flex-wrap gap-2">
          {types.map(t => {
            const Icon = getIcon(t.icon);
            const active = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleType(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Start time <span className="text-muted-foreground">(optional)</span></Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>End time <span className="text-muted-foreground">(optional)</span></Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Google Maps link <span className="text-muted-foreground">(optional)</span></Label>
        <Input type="url" placeholder="https://maps.google.com/…" value={mapLink} onChange={e => setMapLink(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <div className="flex gap-2">
          {(["planned", "done", "skipped"] as ActivityStatus[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
        <Input placeholder="Any notes…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
