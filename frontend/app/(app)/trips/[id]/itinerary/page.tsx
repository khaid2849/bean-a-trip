"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Plus, Trash2, Calendar, List, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ActivityList } from "@/components/itinerary/ActivityList";
import { ActivityForm } from "@/components/itinerary/ActivityForm";
import { useItinerary, useCreateDay, useDeleteDay, useUpdateDay, useUpdateActivity } from "@/hooks/useItinerary";
import { useTrip } from "@/hooks/useTrips";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/itinerary";

const ItineraryCalendar = dynamic(() => import("@/components/itinerary/ItineraryCalendar"), { ssr: false });

type View = "list" | "calendar";

function EditActivityModal({ tripId, activity, onClose }: {
  tripId: string;
  activity: Activity;
  onClose: () => void;
}) {
  const { mutateAsync, isPending } = useUpdateActivity(tripId, activity.day_id, activity.id);
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit activity</DialogTitle></DialogHeader>
        <ActivityForm
          defaultValues={activity}
          onSubmit={async (data) => { await mutateAsync(data); onClose(); }}
          isLoading={isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const { id: tripId } = params;
  const { data: days = [], isLoading } = useItinerary(tripId);
  const { data: trip } = useTrip(tripId);
  const { mutateAsync: createDay, isPending: isCreating } = useCreateDay(tripId);
  const { mutateAsync: deleteDay } = useDeleteDay(tripId);
  const { mutateAsync: updateDay } = useUpdateDay(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [editingDate, setEditingDate] = useState(false);
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [newDayDate, setNewDayDate] = useState("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const selectedDay = days.find(d => d.id === (selectedDayId ?? days[0]?.id));

  function openAddDay() {
    const lastDay = days[days.length - 1];
    let defaultDate: string;
    if (lastDay) {
      const d = new Date(lastDay.date);
      d.setDate(d.getDate() + 1);
      defaultDate = d.toISOString().split("T")[0];
    } else {
      defaultDate = trip?.start_date ?? new Date().toISOString().split("T")[0];
    }
    setNewDayDate(defaultDate);
    setAddDayOpen(true);
  }

  async function handleAddDay() {
    if (!newDayDate) return;
    const created = await createDay(newDayDate);
    setSelectedDayId(created.id);
    setAddDayOpen(false);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Itinerary</h2>
            <p className="text-sm text-muted-foreground">{days.length} {days.length === 1 ? "day" : "days"} planned</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-[var(--border-default)] bg-washi-100 dark:bg-sumi-100 p-0.5">
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === "list" ? "bg-asagi text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")}>
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === "calendar" ? "bg-asagi text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")}>
              <Calendar className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>
          <Button className="gap-2 bg-asagi hover:bg-asagi-mid text-white font-medium" onClick={openAddDay} disabled={isCreating}>
            <Plus className="h-4 w-4" /> Add day
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-6">
          <div className="w-44 shrink-0 space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-hover)] py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-asagi-lt dark:bg-[#102838]">
            <Calendar className="h-8 w-8 text-asagi" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-[var(--text-primary)]">No days yet</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Add your first day to start planning the itinerary.</p>
          <Button className="mt-6 gap-2 bg-asagi hover:bg-asagi-mid text-white font-medium" onClick={openAddDay}>
            <Plus className="h-4 w-4" /> Add first day
          </Button>
        </div>
      ) : view === "calendar" ? (
        <ItineraryCalendar
          days={days}
          onDayClick={(dayId) => { setSelectedDayId(dayId); setView("list"); }}
          onEditActivity={(activity) => setEditingActivity(activity)}
        />
      ) : (
        <div className="flex gap-6">
          {/* Day tabs */}
          <div className="w-44 shrink-0 space-y-1.5">
            {days.map(day => {
              const isActive = (selectedDayId ?? days[0]?.id) === day.id;
              const doneCount = day.activities.filter(a => a.status === "done").length;
              const totalCount = day.activities.length;
              const donePercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

              return (
                <div key={day.id} className="group relative">
                  <button
                    onClick={() => { setSelectedDayId(day.id); setEditingDate(false); }}
                    className={cn(
                      "w-full rounded-xl border bg-white dark:bg-sumi-100 px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "border-asagi border-l-[3px]"
                        : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <p className="text-xs font-medium text-asagi">Day {day.day_number}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      {totalCount} {totalCount === 1 ? "activity" : "activities"}
                    </p>
                    {totalCount > 0 && (
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
                        <div
                          className="h-full rounded-full bg-asagi transition-all"
                          style={{ width: `${donePercent}%` }}
                        />
                      </div>
                    )}
                  </button>
                  <Button
                    variant="ghost" size="icon"
                    className="absolute -right-1 -top-1 hidden h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive group-hover:flex"
                    onClick={() => {
                      if (confirm("Delete this day?")) {
                        deleteDay(day.id);
                        if (selectedDayId === day.id) setSelectedDayId(null);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}

            {/* Add day tile */}
            <button
              onClick={openAddDay}
              className="w-full rounded-xl border border-dashed border-[var(--border-hover)] px-3 py-2.5 text-left text-xs text-[var(--text-tertiary)] transition-colors hover:border-asagi hover:text-asagi"
            >
              + Add day
            </button>
          </div>

          {/* Activities panel */}
          <div className="flex-1">
            {selectedDay ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-asagi">Day {selectedDay.day_number}</h3>
                  {editingDate ? (
                    <input
                      type="date"
                      defaultValue={selectedDay.date}
                      autoFocus
                      className="mt-0.5 rounded-md border px-2 py-0.5 text-sm"
                      onBlur={async (e) => {
                        if (e.target.value && e.target.value !== selectedDay.date) {
                          await updateDay({ dayId: selectedDay.id, date: e.target.value });
                        }
                        setEditingDate(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") setEditingDate(false);
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingDate(true)}
                      className="group flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {new Date(selectedDay.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
                <ActivityList key={selectedDay.id} tripId={tripId} dayId={selectedDay.id} activities={selectedDay.activities} />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Select a day to view activities</div>
            )}
          </div>
        </div>
      )}
      {editingActivity && (
        <EditActivityModal
          tripId={tripId}
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}

      <Dialog open={addDayOpen} onOpenChange={setAddDayOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add day</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="day-date">Date</Label>
            <Input
              id="day-date"
              type="date"
              value={newDayDate}
              min={trip?.start_date}
              max={trip?.end_date}
              onChange={(e) => setNewDayDate(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddDay(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDayOpen(false)}>Cancel</Button>
            <Button className="bg-asagi hover:bg-asagi-mid text-white" onClick={handleAddDay} disabled={!newDayDate || isCreating}>Add day</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
