"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, CalendarDays, Trash2, ArrowLeft,
  Thermometer, Droplets, Wind, RefreshCw,
  Wallet, Bookmark, CheckSquare, BookOpen,
} from "lucide-react";
import { EditTripDialog } from "@/components/trips/EditTripDialog";
import { Button } from "@/components/ui/button";
import { useTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useItinerary } from "@/hooks/useItinerary";
import { useExpenses, useExpenseSummary } from "@/hooks/useExpenses";
import { useBookings } from "@/hooks/useBookings";
import { usePlaces } from "@/hooks/usePlaces";
import { useChecklist } from "@/hooks/useChecklist";
import { useNotes } from "@/hooks/useNotes";
import { usePhotos } from "@/hooks/usePhotos";
import { useWeather } from "@/hooks/useWeather";
import { getDaysUntil, formatDateRange, getTripDuration } from "@/lib/trip-utils";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/trip";

// ── WMO weather codes ────────────────────────────────────────────────────────
const WMO: Record<number, { label: string; emoji: string }> = {
  0:  { label: "Clear sky",            emoji: "☀️" },
  1:  { label: "Mainly clear",         emoji: "🌤️" },
  2:  { label: "Partly cloudy",        emoji: "⛅" },
  3:  { label: "Overcast",             emoji: "☁️" },
  45: { label: "Foggy",                emoji: "🌫️" },
  48: { label: "Icy fog",              emoji: "🌫️" },
  51: { label: "Light drizzle",        emoji: "🌦️" },
  53: { label: "Drizzle",              emoji: "🌦️" },
  55: { label: "Heavy drizzle",        emoji: "🌧️" },
  61: { label: "Slight rain",          emoji: "🌧️" },
  63: { label: "Rain",                 emoji: "🌧️" },
  65: { label: "Heavy rain",           emoji: "🌧️" },
  71: { label: "Slight snow",          emoji: "🌨️" },
  73: { label: "Snow",                 emoji: "❄️"  },
  75: { label: "Heavy snow",           emoji: "❄️"  },
  77: { label: "Snow grains",          emoji: "🌨️" },
  80: { label: "Slight showers",       emoji: "🌦️" },
  81: { label: "Showers",              emoji: "🌧️" },
  82: { label: "Heavy showers",        emoji: "⛈️" },
  95: { label: "Thunderstorm",         emoji: "⛈️" },
  96: { label: "Thunderstorm w/ hail", emoji: "⛈️" },
  99: { label: "Severe thunderstorm",  emoji: "⛈️" },
};
const wmoInfo = (code: number) => WMO[code] ?? { label: "Unknown", emoji: "🌡️" };

// ── Section accent config (uses app's color tokens) ──────────────────────────
const SECTION_ACCENTS = {
  itinerary: { color: "#4E7A8F", bg: "rgba(78, 122, 143, 0.10)"  }, // asagi
  expenses:  { color: "#4A6741", bg: "rgba(74, 103, 65,  0.10)"  }, // matcha
  bookings:  { color: "#C48A3F", bg: "rgba(196,138, 63,  0.10)"  }, // kincha
  places:    { color: "#7DAFC4", bg: "rgba(125,175, 196, 0.10)"  }, // asagi-mid
  checklist: { color: "#8B6B8A", bg: "rgba(139,107, 138, 0.10)"  }, // fuji
  journal:   { color: "#C0533A", bg: "rgba(192, 83,  58,  0.10)" }, // terracotta
} as const;

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<Trip["status"], string> = {
  planning:  "bg-fuji-lt   dark:bg-[#3D2840] text-fuji-dk   dark:text-fuji-lt",
  active:    "bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt",
  completed: "bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt",
};
const STATUS_LABEL: Record<Trip["status"], string> = {
  planning: "Planning", active: "Active", completed: "Completed",
};

// ── Mini progress bar ─────────────────────────────────────────────────────────
function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Countdown ────────────────────────────────────────────────────────────────
function calcLeft(dateStr: string) {
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

function CountdownCard({ startDate }: { startDate: string }) {
  const [t, setT] = useState(() => calcLeft(startDate));
  useEffect(() => {
    const id = setInterval(() => setT(calcLeft(startDate)), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  const units = t
    ? [{ l: "days", v: t.days }, { l: "hrs", v: t.hours }, { l: "min", v: t.minutes }, { l: "sec", v: t.seconds }]
    : null;

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-5">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
        Trip begins in
      </p>
      {units ? (
        <div className="flex items-end">
          {units.map(({ l, v }, i) => (
            <div key={l} className="flex items-end">
              {i > 0 && (
                <span className="mb-[3px] mx-2 text-xl font-normal leading-none select-none text-[var(--text-tertiary)]">
                  :
                </span>
              )}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                  {l}
                </span>
                <span className="text-[2.25rem] font-medium tabular-nums leading-none text-[var(--text-primary)]">
                  {String(v).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm font-normal text-[var(--text-secondary)]">Trip has started — enjoy the journey.</p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TripPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data: trip, isLoading } = useTrip(id);
  const { data: days = [] } = useItinerary(id);
  const { data: expenseData } = useExpenses(id);
  const { data: summary } = useExpenseSummary(id);
  const { data: bookings = [] } = useBookings(id);
  const { data: places = [] } = usePlaces(id);
  const { data: checklist = [] } = useChecklist(id);
  const { data: notes = [] } = useNotes(id);
  const { data: photos = [] } = usePhotos(id);
  const { mutateAsync: deleteTrip, isPending: isDeleting } = useDeleteTrip();

  const expenses      = expenseData?.expenses ?? [];
  const allActivities = days.flatMap(d => d.activities);
  const doneCount     = allActivities.filter(a => a.status === "done").length;
  const visitedCount  = places.filter(p => p.visited).length;
  const checkedCount  = checklist.filter(i => i.is_checked).length;

  const activityPct  = allActivities.length ? Math.round((doneCount / allActivities.length) * 100) : 0;
  const budgetPct    = summary?.total_budget  ? Math.round((summary.total_spent / summary.total_budget) * 100) : null;
  const placePct     = places.length          ? Math.round((visitedCount / places.length) * 100) : 0;
  const checklistPct = checklist.length       ? Math.round((checkedCount / checklist.length) * 100) : 0;
  const journalCount = photos.length + notes.length;

  const showWeather   = trip?.status === "planning" || trip?.status === "active";
  const showCountdown = trip?.status === "planning" && getDaysUntil(trip.start_date) > 0;
  const showTimeline  = showCountdown || showWeather;

  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
    refetch: refetchWeather,
    isFetching: weatherFetching,
  } = useWeather(trip?.destination ?? "", showWeather && !!trip?.destination);

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 rounded-lg bg-washi-100 dark:bg-sumi-100" />
        <div className="h-48 rounded-xl bg-washi-100 dark:bg-sumi-100" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-7 w-24 rounded-full bg-washi-100 dark:bg-sumi-100" />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-washi-100 dark:bg-sumi-100" />)}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-medium text-[var(--text-primary)]">Trip not found</p>
        <Link href="/dashboard" className="mt-3 text-sm text-terracotta hover:underline">← Back to dashboard</Link>
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm(`Delete "${trip!.name}"? This cannot be undone.`)) return;
    await deleteTrip(trip!.id);
    router.push("/dashboard");
  }

  const duration = getTripDuration(trip.start_date, trip.end_date);

  const sections = [
    {
      id: "itinerary",
      label: "Itinerary",
      description: "Daily schedule & activities",
      icon: CalendarDays,
      href: `/trips/${id}/itinerary`,
      ...SECTION_ACCENTS.itinerary,
      countText: `${allActivities.length} ${allActivities.length === 1 ? "activity" : "activities"}`,
      progress: activityPct,
    },
    {
      id: "expenses",
      label: "Expenses",
      description: "Budget & spending tracker",
      icon: Wallet,
      href: `/trips/${id}/expenses`,
      ...SECTION_ACCENTS.expenses,
      countText: `${expenses.length} ${expenses.length === 1 ? "transaction" : "transactions"}`,
      progress: budgetPct,
    },
    {
      id: "bookings",
      label: "Bookings",
      description: "Flights, hotels & more",
      icon: Bookmark,
      href: `/trips/${id}/bookings`,
      ...SECTION_ACCENTS.bookings,
      countText: `${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`,
      progress: null,
    },
    {
      id: "places",
      label: "Places",
      description: "Attractions & restaurants",
      icon: MapPin,
      href: `/trips/${id}/places`,
      ...SECTION_ACCENTS.places,
      countText: `${places.length} ${places.length === 1 ? "place" : "places"}`,
      progress: placePct,
    },
    {
      id: "checklist",
      label: "Checklist",
      description: "Packing & prep tasks",
      icon: CheckSquare,
      href: `/trips/${id}/checklist`,
      ...SECTION_ACCENTS.checklist,
      countText: `${checkedCount} / ${checklist.length} done`,
      progress: checklistPct,
    },
    {
      id: "journal",
      label: "Journal",
      description: "Photos & notes",
      icon: BookOpen,
      href: `/trips/${id}/journals`,
      ...SECTION_ACCENTS.journal,
      countText: `${journalCount} ${journalCount === 1 ? "item" : "items"}`,
      progress: null,
    },
  ];

  return (
    <div className="animate-fade-in space-y-5">

      {/* Back nav */}
      <Link href="/dashboard">
        <button className="flex items-center gap-1.5 text-sm font-normal text-[var(--text-secondary)] transition-opacity hover:opacity-70">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </button>
      </Link>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-xl bg-white dark:bg-sumi-100"
        style={{ minHeight: 200 }}
      >
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${trip.cover_color}28 0%, transparent 70%)` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }} />

        {/* top-right controls */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_BADGE[trip.status])}>
            {STATUS_LABEL[trip.status]}
          </span>
          <EditTripDialog trip={trip} iconOnly />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-red-400"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* bottom-left content */}
        <div className="relative z-10 px-5 pb-5 pt-16">
          <h2 className="text-2xl font-medium text-white">{trip.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {trip.destination}
            <span className="mx-1 text-white/30">·</span>
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        </div>
      </div>

      {/* ── Stat pills ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-100 px-3 py-1 text-xs font-normal text-[var(--text-secondary)]">
          {duration} {duration === 1 ? "day" : "days"}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-100 px-3 py-1 text-xs font-normal text-[var(--text-secondary)]">
          {allActivities.length} activities
        </span>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-normal",
          activityPct === 0
            ? "border-kincha/20 bg-kincha-lt/40 dark:bg-[#4A2E08]/40 text-kincha-dk dark:text-kincha-lt"
            : "border-[var(--border-default)] bg-washi-50 dark:bg-sumi-100 text-[var(--text-secondary)]"
        )}>
          {activityPct === 0 && <span className="h-1.5 w-1.5 rounded-full bg-kincha" />}
          {activityPct}% done
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-100 px-3 py-1 text-xs font-normal text-[var(--text-secondary)]">
          {bookings.length} bookings
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-100 px-3 py-1 text-xs font-normal text-[var(--text-secondary)]">
          {places.length} places
        </span>
      </div>

      {/* ── Countdown + Weather ───────────────────────────────────────────── */}
      {showTimeline && (
        <div className={cn("grid gap-3", showCountdown && showWeather ? "grid-cols-2" : "grid-cols-1")}>

          {showCountdown && <CountdownCard startDate={trip.start_date} />}

          {showWeather && (
            <div className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                    Current weather
                  </p>
                  {weather && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {weather.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => refetchWeather()}
                  disabled={weatherFetching}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors hover:bg-washi-100 dark:hover:bg-sumi-50"
                  aria-label="Refresh weather"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", weatherFetching && "animate-spin")} />
                </button>
              </div>

              {weatherLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-8 w-32 rounded bg-washi-100 dark:bg-sumi-50" />
                  <div className="h-4 w-24 rounded bg-washi-100 dark:bg-sumi-50" />
                </div>
              ) : weatherError || !weather ? (
                <p className="text-sm font-normal text-[var(--text-secondary)]">
                  Could not load weather for {trip.destination}.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl leading-none select-none" role="img" aria-label={wmoInfo(weather.weatherCode).label}>
                      {wmoInfo(weather.weatherCode).emoji}
                    </span>
                    <div>
                      <p className="text-3xl font-medium tabular-nums leading-none text-[var(--text-primary)]">
                        {weather.temperature}{weather.unit}
                      </p>
                      <p className="mt-0.5 text-sm font-normal text-[var(--text-secondary)]">
                        {wmoInfo(weather.weatherCode).label}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-normal text-[var(--text-secondary)]">
                      <Thermometer className="h-3.5 w-3.5 text-terracotta" />
                      Feels like {weather.feelsLike}{weather.unit}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-normal text-[var(--text-secondary)]">
                      <Droplets className="h-3.5 w-3.5 text-asagi" />
                      {weather.humidity}% humidity
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-normal text-[var(--text-secondary)]">
                      <Wind className="h-3.5 w-3.5 text-matcha" />
                      {weather.windSpeed} km/h
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Section grid ─────────────────────────────────────────────────── */}
      <div>
        {/* Header + quick-access pills */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
            Trip sections
          </p>
          <div className="flex items-center gap-1.5">
            {sections.slice(0, 3).map(s => (
              <Link key={s.label} href={s.href}>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-100 px-2.5 py-1 text-xs font-normal text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">
                  {s.label} ↗
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sections.map(sec => {
            const Icon = sec.icon;
            return (
              <Link key={sec.id} href={sec.href}>
                <div
                  className="group flex h-full cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-washi-50 dark:hover:bg-sumi-50"
                  style={{
                    borderRadius: "0.75rem",
                    borderTop:    "1px solid var(--border-default)",
                    borderRight:  "1px solid var(--border-default)",
                    borderBottom: "1px solid var(--border-default)",
                    borderLeft:   `2px solid ${sec.color}`,
                    background:   "var(--bg-surface)",
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    style={{ background: sec.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: sec.color }} />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{sec.label}</p>
                        <p className="mt-0.5 text-xs font-normal text-[var(--text-secondary)]">{sec.description}</p>
                      </div>
                      <p className="shrink-0 text-xs font-normal tabular-nums text-[var(--text-secondary)]">
                        {sec.countText}
                      </p>
                    </div>

                    {sec.progress !== null && (
                      <div className="mt-3 space-y-1">
                        <MiniBar value={sec.progress} color={sec.color} />
                        <p className="text-right text-[10px] font-normal tabular-nums text-[var(--text-tertiary)]">
                          {sec.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
