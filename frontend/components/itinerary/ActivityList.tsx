"use client";

import { useEffect, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivityCard } from "./ActivityCard";
import { ActivityForm } from "./ActivityForm";
import { useCreateActivity, useDeleteActivity, useReorderActivities } from "@/hooks/useItinerary";
import { cn } from "@/lib/utils";
import type { Activity, ActivityCreate } from "@/types/itinerary";

interface ActivityListProps {
  tripId: string;
  dayId: string;
  activities: Activity[];
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getTimeGap(prev: Activity, next: Activity): number | null {
  if (!prev.end_time || !next.start_time) return null;
  return parseMinutes(next.start_time) - parseMinutes(prev.end_time);
}

export function ActivityList({ tripId, dayId, activities }: ActivityListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [orderedIds, setOrderedIds] = useState<string[]>(() => activities.map(a => a.id));

  const { mutateAsync: createActivity, isPending: isCreating } = useCreateActivity(tripId, dayId);
  const { mutateAsync: deleteActivity } = useDeleteActivity(tripId, dayId);
  const { mutate: reorder } = useReorderActivities(tripId, dayId);

  const activitiesById = Object.fromEntries(activities.map(a => [a.id, a]));
  const ordered = orderedIds.map(id => activitiesById[id]).filter(Boolean) as Activity[];

  useEffect(() => {
    setOrderedIds(activities.map(a => a.id));
  }, [activities]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next);
    reorder(next);
  }

  async function handleCreate(data: ActivityCreate) {
    const created = await createActivity(data);
    setOrderedIds(prev => [...prev, created.id]);
    setAddOpen(false);
  }

  // First "planned" (non-done, non-skipped) activity is "active"
  const activeIndex = ordered.findIndex(a => a.status === "planned");
  const doneCount   = ordered.filter(a => a.status === "done").length;
  const totalCount  = ordered.length;
  const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* ─── Journey route ─────────────────────────────────────────────────── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {ordered.length > 0 ? (
          <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
            {ordered.map((activity, index) => {
              const prev = ordered[index - 1];
              const gap  = prev ? getTimeGap(prev, activity) : null;
              const showOverlap  = gap !== null && gap < 0;
              const showLongGap  = gap !== null && gap >= 90;

              return (
                <div key={activity.id}>
                  {/* ── Gap / overlap indicator ──────────────────────────── */}
                  {(showOverlap || showLongGap) && (
                    <div className="flex items-center">
                      {/* Aligns with the timeline column center */}
                      <div className="w-11 shrink-0 flex justify-center">
                        <div className={cn(
                          "w-[3px] h-3",
                          showOverlap
                            ? "bg-kincha dark:bg-kincha-lt"
                            : ordered[index - 1]?.status === "done"
                            ? "bg-amber-400 dark:bg-amber-500"
                            : "bg-neutral-200 dark:bg-sumi-100"
                        )} />
                      </div>
                      <div className={cn(
                        "ml-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        showOverlap
                          ? "bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt"
                          : "bg-washi-100 dark:bg-sumi-100 text-[var(--text-tertiary)]"
                      )}>
                        {showOverlap ? "⚠ Overlapping" : `${gap} min gap`}
                      </div>
                    </div>
                  )}

                  <ActivityCard
                    activity={activity}
                    tripId={tripId}
                    onDelete={() => {
                      deleteActivity(activity.id);
                      setOrderedIds(prev => prev.filter(id => id !== activity.id));
                    }}
                    activeIndex={activeIndex}
                    selfIndex={index}
                    isLast={index === ordered.length - 1}
                    isPrevDone={!!(ordered[index - 1]?.status === "done")}
                  />
                </div>
              );
            })}
          </SortableContext>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-hover)] py-10 text-center">
            <Calendar className="h-8 w-8 text-[var(--text-tertiary)] mb-2 opacity-50" />
            <p className="text-sm text-[var(--text-secondary)]">No stops yet</p>
            <p className="text-xs text-[var(--text-tertiary)]">Add your first stop for this day</p>
          </div>
        )}
      </DndContext>

      {/* ─── Add stop button ────────────────────────────────────────────────── */}
      <button
        onClick={() => setAddOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-[#2A1E0A] dark:hover:text-amber-400"
      >
        <Plus className="h-4 w-4" /> Add stop
      </button>

      {/* ─── Day progress bar ───────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span>{doneCount} / {totalCount} completed</span>
            <span className={cn(donePercent === 100 && "text-amber-500 font-semibold")}>{donePercent}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-sumi-100">
            <div
              className="h-full rounded-full bg-amber-400 dark:bg-amber-500 transition-all duration-500"
              style={{ width: `${donePercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── Add stop dialog ────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add stop</DialogTitle></DialogHeader>
          <ActivityForm onSubmit={handleCreate} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
