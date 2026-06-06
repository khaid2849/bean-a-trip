"use client";

import Link from "next/link";
import { Globe, Calendar, Clock, Map, CheckCircle, PenLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoCard } from "@/components/bento/BentoCard";
import { TripCard } from "@/components/trips/TripCard";
import { CreateTripDialog } from "@/components/trips/CreateTripDialog";
import { useTrips } from "@/hooks/useTrips";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenseSummary } from "@/hooks/useExpenses";
import { getDaysUntil } from "@/lib/trip-utils";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/trip";

function fmt(n: number) { return `$${Number(n).toFixed(0)}`; }

function ActiveTripWidgets({ trip }: { trip: Trip }) {
  const { data: days = [] } = useItinerary(trip.id);
  const { data: summary } = useExpenseSummary(trip.id);

  const today = new Date().toISOString().split("T")[0];
  const upcomingActivities = days
    .filter(d => d.date >= today)
    .flatMap(d => d.activities.map(a => ({ ...a, date: d.date })))
    .filter(a => a.status === "planned")
    .slice(0, 4);

  return (
    <>
      {/* Upcoming activities */}
      <BentoCard size="md" title="Upcoming Activities" description={`From ${trip.name}`}>
        {upcomingActivities.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <div className="text-center">
              <Calendar className="mx-auto h-6 w-6 mb-1 text-[var(--text-tertiary)] opacity-40" />
              <p className="text-sm italic text-[var(--text-tertiary)]">No upcoming activities</p>
            </div>
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            {upcomingActivities.map(activity => (
              <Link key={activity.id} href={`/trips/${trip.id}/itinerary`}>
                <div className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-washi-50 dark:hover:bg-sumi-50">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-asagi" />
                    <span className="text-sm text-[var(--text-primary)] line-clamp-1">{activity.title}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-xs text-asagi">
                    {activity.date === today ? "Today" : new Date(activity.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    {activity.start_time ? ` · ${activity.start_time}` : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </BentoCard>

      {/* Budget summary */}
      {summary && (
        <BentoCard size="md" title="Budget Overview" description={`From ${trip.name}`}>
          <div className="mt-1 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-medium text-terracotta">{fmt(summary.total_spent)}</p>
                <p className="text-xs text-[var(--text-tertiary)]">of {fmt(summary.total_budget)} budget</p>
              </div>
              <Link href={`/trips/${trip.id}/expenses`} className="text-xs text-matcha hover:underline">
                View all →
              </Link>
            </div>
            {summary.total_budget > 0 && (
              <>
                <div className="h-2 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      summary.total_spent > summary.total_budget ? "bg-terracotta" : "bg-matcha"
                    )}
                    style={{ width: `${Math.min((summary.total_spent / summary.total_budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={cn(summary.remaining < 0 ? "text-[var(--text-danger)] font-medium" : "text-matcha font-medium")}>
                    {summary.remaining < 0
                      ? `${fmt(Math.abs(summary.remaining))} over budget`
                      : `${fmt(summary.remaining)} remaining`}
                  </span>
                  <span className="text-[var(--text-tertiary)]">
                    {Math.round((summary.total_spent / summary.total_budget) * 100)}%
                  </span>
                </div>
              </>
            )}
            {summary.total_budget === 0 && (
              <p className="text-xs text-[var(--text-tertiary)]">
                <Link href={`/trips/${trip.id}/expenses`} className="text-matcha hover:underline">
                  Set a budget →
                </Link>
              </p>
            )}
          </div>
        </BentoCard>
      )}
    </>
  );
}

export default function DashboardPage() {
  const { data: trips = [], isLoading } = useTrips();

  const activeTrip = trips.find(t => t.status === "active");
  const upcomingTrips = trips.filter(t => t.status === "planning").sort(
    (a, b) => getDaysUntil(a.start_date) - getDaysUntil(b.start_date)
  );
  const completedTrips = trips.filter(t => t.status === "completed");
  const nextTrip = upcomingTrips[0];
  const daysToNext = nextTrip ? getDaysUntil(nextTrip.start_date) : null;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-[var(--text-primary)]">Your Trips</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            {trips.length === 0
              ? "No trips yet — create your first one."
              : `${trips.length} trip${trips.length > 1 ? "s" : ""} total`}
          </p>
        </div>
        <CreateTripDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border-default)]">
              <Skeleton className="h-28 rounded-none" />
              <div className="bg-white dark:bg-sumi-100 px-4 py-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Map className="h-4 w-4 text-terracotta" />
                <span className="text-xs text-[var(--text-tertiary)]">Total trips</span>
              </div>
              <p className="text-2xl font-medium text-[var(--text-primary)]">{trips.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-terracotta" />
                <span className="text-xs text-[var(--text-tertiary)]">Next trip in</span>
              </div>
              <p className={cn("text-2xl font-medium", daysToNext !== null && daysToNext <= 6 ? "text-kincha" : "text-[var(--text-primary)]")}>
                {daysToNext !== null ? (daysToNext < 0 ? "Today" : daysToNext === 0 ? "Tomorrow" : `${daysToNext}d`) : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-terracotta" />
                <span className="text-xs text-[var(--text-tertiary)]">Completed</span>
              </div>
              <p className="text-2xl font-medium text-[var(--text-primary)]">{completedTrips.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4">
              <div className="mb-2 flex items-center gap-2">
                <PenLine className="h-4 w-4 text-terracotta" />
                <span className="text-xs text-[var(--text-tertiary)]">Planning</span>
              </div>
              <p className="text-2xl font-medium text-[var(--text-primary)]">{upcomingTrips.length}</p>
            </div>
          </div>

          {/* Active trip */}
          {activeTrip && (
            <section className="space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Active trip</h3>
              <BentoGrid>
                <BentoCard size="md" className="p-0 overflow-hidden border-0">
                  <TripCard trip={activeTrip} hero />
                </BentoCard>
                <ActiveTripWidgets trip={activeTrip} />
              </BentoGrid>
            </section>
          )}

          {/* Upcoming */}
          {upcomingTrips.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Upcoming</h3>
              <BentoGrid>
                {upcomingTrips.map((trip: Trip) => (
                  <BentoCard key={trip.id} size="sm" className="p-0 overflow-hidden border-0">
                    <TripCard trip={trip} />
                  </BentoCard>
                ))}
              </BentoGrid>
            </section>
          )}

          {/* Completed */}
          {completedTrips.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Completed</h3>
              <BentoGrid>
                {completedTrips.map((trip: Trip) => (
                  <BentoCard key={trip.id} size="sm" className="p-0 overflow-hidden border-0">
                    <TripCard trip={trip} />
                  </BentoCard>
                ))}
              </BentoGrid>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Globe className="h-12 w-12 text-[var(--text-tertiary)]" />
      <h3 className="mt-4 text-xl font-medium text-[var(--text-secondary)]">Plan your first adventure</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-tertiary)]">
        Create a trip to start building your itinerary, tracking expenses, and saving places.
      </p>
      <div className="mt-6"><CreateTripDialog /></div>
    </div>
  );
}
