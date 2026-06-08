"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Pencil, Trash2, BedDouble, Truck, UtensilsCrossed, Circle, Zap,
  Camera, Tent, Dumbbell, Mountain, Dice5, Landmark, ExternalLink, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivityForm } from "./ActivityForm";
import { useUpdateActivity } from "@/hooks/useItinerary";
import { getActivityTypeConfig } from "@/lib/activity-types";
import { getIcon } from "@/lib/icon-registry";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";
import type { Activity, ActivityCreate, ActivityType } from "@/types/itinerary";

export const TYPE_ICON: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  activity:      Zap,
  food:          UtensilsCrossed,
  transport:     Truck,
  accommodation: BedDouble,
  photography:   Camera,
  camping:       Tent,
  sports:        Dumbbell,
  hiking:        Mountain,
  gambling:      Dice5,
  sightseeing:   Landmark,
  other:         Circle,
};

interface ActivityCardProps {
  activity: Activity;
  tripId: string;
  onDelete: () => void;
  /** Index of this station in the ordered list — used to determine active state */
  activeIndex: number;
  selfIndex: number;
  isLast: boolean;
  /** Whether the previous activity was completed — determines top segment color */
  isPrevDone: boolean;
}

export function ActivityCard({
  activity,
  tripId,
  onDelete,
  activeIndex,
  selfIndex,
  isLast,
  isPrevDone,
}: ActivityCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const { mutateAsync: updateActivity, isPending } = useUpdateActivity(tripId, activity.day_id, activity.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });
  const { settings } = useSettings();

  const isDone    = activity.status === "done";
  const isSkipped = activity.status === "skipped";
  const isActive  = selfIndex === activeIndex;

  const primaryType = activity.types[0] ?? "other";
  // Prefer the icon/color configured in settings; fall back to the static map
  const settingsType = settings.activityTypes.find(t => t.id === primaryType);
  const Icon = settingsType ? getIcon(settingsType.icon) : (TYPE_ICON[primaryType as ActivityType] ?? Circle);
  const primaryColor = settingsType?.color ?? getActivityTypeConfig(primaryType).accentColor;

  async function handleUpdate(data: ActivityCreate) {
    await updateActivity(data);
    setEditOpen(false);
  }

  async function toggleDone() {
    if (isSkipped || isPending) return;
    await updateActivity({ status: isDone ? "planned" : "done" });
  }

  // ─── Segment / node color tokens ─────────────────────────────────────────
  const amberLine  = "bg-amber-400 dark:bg-amber-500";
  const neutralLine = "bg-neutral-200 dark:bg-sumi-100";

  const topSegColor    = isPrevDone ? amberLine : neutralLine;
  const bottomSegColor = isDone     ? amberLine : neutralLine;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex", isDragging && "opacity-50 z-50 relative")}
    >
      {/* ─── Left: timeline column ───────────────────────────────────────── */}
      <div className="w-11 shrink-0 flex flex-col items-center select-none">

        {/* Top segment — connects from previous station */}
        <div className={cn("w-[3px] h-4 transition-colors duration-500", topSegColor)} />

        {/* Station node */}
        <button
          onClick={toggleDone}
          disabled={isSkipped || isPending}
          title={isDone ? "Mark as planned" : "Mark as done"}
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
            isDone
              ? "w-8 h-8 bg-amber-400 dark:bg-amber-500 shadow-sm"
              : isActive
              ? "w-9 h-9 border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-sumi-100"
              : isSkipped
              ? "w-7 h-7 border border-dashed border-neutral-300 dark:border-sumi-200 bg-transparent cursor-default opacity-40"
              : "w-7 h-7 border border-dashed border-neutral-300 dark:border-sumi-200 bg-white dark:bg-sumi-100 hover:border-amber-300 hover:scale-105"
          )}
        >
          {isDone ? (
            <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
          ) : (
            <Icon
              className={cn(
                "transition-colors",
                isActive
                  ? "h-4 w-4 text-amber-500 dark:text-amber-400"
                  : "h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
              )}
            />
          )}
          {/* Pulsing ring for active station */}
          {isActive && (
            <span className="pointer-events-none absolute inset-[-3px] rounded-full border-2 border-amber-400 dark:border-amber-500 animate-ping opacity-30" />
          )}
        </button>

        {/* Bottom segment — connects to next station */}
        {!isLast && (
          <div className={cn("flex-1 w-[3px] mt-0 min-h-[32px] transition-colors duration-500", bottomSegColor)} />
        )}
      </div>

      {/* ─── Right: activity card ─────────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex-1 ml-3 mb-2 rounded-xl border border-l-[3px] p-3 transition-all duration-300",
          isDone
            ? "opacity-60 bg-washi-50 dark:bg-sumi-50 border-transparent"
            : isActive
            ? "bg-white dark:bg-sumi-100 border-amber-200 dark:border-amber-800/50 shadow-sm"
            : isSkipped
            ? "opacity-35 bg-washi-50 dark:bg-sumi-50 border-[var(--border-default)]"
            : "bg-washi-50 dark:bg-sumi-50 border-[var(--border-default)] hover:border-[var(--border-hover)]"
        )}
        style={!(isDone || isSkipped) ? { borderLeftColor: primaryColor } : undefined}
      >
        {/* "In progress" pill for active station */}
        {isActive && (
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            In progress
          </p>
        )}

        {/* Header row: time + title + actions */}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {/* Time range */}
            {(activity.start_time || activity.end_time) && (
              <p className={cn(
                "mb-0.5 text-[10px] font-mono tabular-nums",
                isDone ? "text-amber-400/70 dark:text-amber-500/60" : isActive ? "text-amber-500 dark:text-amber-400 font-semibold" : "text-[var(--text-tertiary)]"
              )}>
                {activity.start_time}
                {activity.start_time && activity.end_time ? " – " : ""}
                {activity.end_time}
              </p>
            )}

            {/* Title */}
            <p className={cn(
              "font-semibold text-[13px] leading-snug",
              isDone || isSkipped
                ? "line-through text-[var(--text-tertiary)]"
                : isActive
                ? "text-amber-800 dark:text-amber-300"
                : "text-[var(--text-primary)]"
            )}>
              {activity.title}
            </p>

            {/* Notes subtitle */}
            {activity.notes && (
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] line-clamp-1 leading-relaxed">
                {activity.notes}
              </p>
            )}

            {/* Type badges */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {activity.types.map(t => {
                const sType = settings.activityTypes.find(x => x.id === t);
                const TIcon = sType ? getIcon(sType.icon) : (TYPE_ICON[t as ActivityType] ?? Circle);
                const cfg   = getActivityTypeConfig(t);
                const label = sType?.name ?? cfg.label;
                const color = sType?.color;
                return (
                  <span
                    key={t}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                      !color && cfg.badgeClass,
                      (isDone || isSkipped) && "opacity-60"
                    )}
                    style={color ? { backgroundColor: `${color}18`, color } : undefined}
                  >
                    <TIcon className="h-2.5 w-2.5" />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col items-end gap-0.5 -mr-1">
            <div className="flex items-center gap-0.5">
              {activity.map_link && (
                <a href={activity.map_link} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-[var(--text-tertiary)] hover:text-asagi hover:bg-asagi-lt dark:hover:bg-[#102838]"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[var(--text-tertiary)] hover:text-red-500"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <GripVertical className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit activity</DialogTitle></DialogHeader>
          <ActivityForm
            defaultValues={activity}
            onSubmit={handleUpdate}
            isLoading={isPending}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
