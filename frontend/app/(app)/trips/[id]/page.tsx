"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Calendar, BookOpen, Wallet,
  Bookmark, CheckSquare, ArrowLeft, Trash2,
  ListChecks, Target,
} from "lucide-react";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { EditTripDialog } from "@/components/trips/EditTripDialog";
import { Button } from "@/components/ui/button";
import { useTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenses } from "@/hooks/useExpenses";
import { useBookings } from "@/hooks/useBookings";
import { usePlaces } from "@/hooks/usePlaces";
import { useChecklist } from "@/hooks/useChecklist";
import { useNotes } from "@/hooks/useNotes";
import { usePhotos } from "@/hooks/usePhotos";
import {
  getDaysUntil, formatDateRange, getTripDuration,
  STATUS_LABEL, getDestinationGradient,
} from "@/lib/trip-utils";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/trip";

// ─── Countdown component ──────────────────────────────────────────────────
function calcTimeLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function TripCountdown({ startDate }: { startDate: string }) {
  const [t, setT] = useState(() => calcTimeLeft(startDate));

  useEffect(() => {
    const id = setInterval(() => setT(calcTimeLeft(startDate)), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  if (!t) return null;

  const units = [
    { label: "Days",    value: t.days },
    { label: "Hours",   value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-50 px-5 py-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
        Trip begins in
      </p>
      <div className="flex items-end gap-0">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-end">
            {i > 0 && (
              <span className="mb-0.5 mx-2 text-2xl font-light text-[var(--text-tertiary)] leading-none select-none">:</span>
            )}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                {label}
              </span>
              <span className="text-3xl font-bold tabular-nums leading-none text-[var(--text-primary)]">
                {String(value).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<Trip["status"], string> = {
  planning:  "bg-fuji-lt dark:bg-[#3D2840] text-fuji-dk dark:text-fuji-lt",
  active:    "bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt",
  completed: "bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt",
};

export default function TripPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data: trip, isLoading } = useTrip(id);
  const { data: days = [] } = useItinerary(id);
  const { data: expenseData } = useExpenses(id);
  const expenses = expenseData?.expenses ?? [];
  const { data: bookings = [] } = useBookings(id);
  const { data: places = [] } = usePlaces(id);
  const { data: checklist = [] } = useChecklist(id);
  const { data: notes = [] } = useNotes(id);
  const { data: photos = [] } = usePhotos(id);
  const { mutateAsync: deleteTrip, isPending: isDeleting } = useDeleteTrip();

  const allActivities = days.flatMap(d => d.activities);
  const doneActivities = allActivities.filter(a => a.status === "done").length;
  const activityProgress = allActivities.length > 0
    ? Math.round((doneActivities / allActivities.length) * 100)
    : null;
  const checkedCount = checklist.filter(i => i.is_checked).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-washi-100 dark:bg-sumi-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-washi-100 dark:bg-sumi-100" />
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-washi-100 dark:bg-sumi-100" />
          ))}
        </div>
        <BentoGrid>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-washi-100 dark:bg-sumi-100" />
          ))}
        </BentoGrid>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-[var(--text-primary)]">Trip not found</p>
        <Link href="/dashboard" className="mt-4 text-sm text-terracotta hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm(`Delete "${trip!.name}"? This cannot be undone.`)) return;
    await deleteTrip(trip!.id);
    router.push("/dashboard");
  }

  const daysUntil = getDaysUntil(trip.start_date);
  const duration = getTripDuration(trip.start_date, trip.end_date);
  const gradient = getDestinationGradient(trip.destination);

  const quickNav = [
    { label: "Itinerary",  icon: Calendar,    href: `/trips/${id}/itinerary`,  description: "Daily schedule & activities", badge: `${days.length} days` },
    { label: "Expenses",   icon: Wallet,       href: `/trips/${id}/expenses`,   description: "Budget & spending tracker",   badge: `${expenses.length} transactions` },
    { label: "Bookings",   icon: Bookmark,     href: `/trips/${id}/bookings`,   description: "Flights, hotels & more",       badge: `${bookings.length} bookings` },
    { label: "Places",     icon: MapPin,       href: `/trips/${id}/places`,     description: "Attractions & restaurants",    badge: `${places.length} places` },
    { label: "Checklist",  icon: CheckSquare,  href: `/trips/${id}/checklist`,  description: "Packing & prep tasks",         badge: `${checkedCount}/${checklist.length} done` },
    { label: "Journal",    icon: BookOpen,     href: `/trips/${id}/journals`,   description: "Photos & journal entries",      badge: `${photos.length + notes.length} items` },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back nav */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
      </Link>

      {/* Hero */}
      <div
        className={cn(
          "relative min-h-[160px] overflow-hidden rounded-2xl flex items-end",
          !trip.cover_photo_url && `bg-gradient-to-br ${gradient}`
        )}
      >
        {trip.cover_photo_url && (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top-right controls */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_BADGE[trip.status])}>
            {STATUS_LABEL[trip.status]}
          </span>
          <EditTripDialog trip={trip} iconOnly />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-red-400"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Bottom-left content */}
        <div className="relative z-10 p-5">
          <h2 className="text-2xl font-semibold text-white">{trip.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="h-4 w-4" /> {trip.destination}
          </p>
          <p className="mt-0.5 text-sm text-white/60">{formatDateRange(trip.start_date, trip.end_date)}</p>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3 border-b border-[var(--border-default)] pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-washi-100 dark:bg-sumi-100 px-3 py-1.5 text-sm text-[var(--text-secondary)]">
          <Calendar className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          {duration} {duration === 1 ? "day" : "days"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-washi-100 dark:bg-sumi-100 px-3 py-1.5 text-sm text-[var(--text-secondary)]">
          <ListChecks className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          {allActivities.length} activities
        </span>
        {activityProgress !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-washi-100 dark:bg-sumi-100 px-3 py-1.5 text-sm">
            <Target className="h-3.5 w-3.5 text-terracotta" />
            <span className="font-medium text-terracotta">{activityProgress}%</span>
            <span className="text-[var(--text-secondary)]"> done</span>
          </span>
        )}
      </div>

      {/* Countdown — only for planning trips with a future start date */}
      {trip.status === "planning" && daysUntil > 0 && (
        <TripCountdown startDate={trip.start_date} />
      )}

      {/* Tab navigation */}
      <div className="flex gap-0.5 overflow-x-auto rounded-xl bg-washi-100 dark:bg-sumi-100 p-1">
        {quickNav.map(({ label, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] whitespace-nowrap transition-colors hover:bg-white dark:hover:bg-sumi-200 hover:text-[var(--text-primary)] hover:shadow-sm"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* Trip sections */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Trip sections
        </h3>
        <BentoGrid>
          {quickNav.map(({ label, icon: Icon, href, description, badge }) => (
            <Link key={label} href={href}>
              <div className="group flex h-full flex-col cursor-pointer rounded-2xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-5 transition-colors hover:border-[var(--border-hover)]">
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 text-[var(--text-tertiary)] transition-colors group-hover:text-terracotta" />
                  <span className="rounded-full bg-washi-100 dark:bg-sumi-50 px-2 py-0.5 text-xs text-[var(--text-tertiary)]">
                    {badge}
                  </span>
                </div>
                <p className="mt-3 font-medium text-[var(--text-primary)]">{label}</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{description}</p>
              </div>
            </Link>
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
