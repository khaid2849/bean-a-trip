"use client";

import Link from "next/link";
import { Calendar, Star } from "lucide-react";
import type { Trip } from "@/types/trip";
import { getDaysUntil, formatDateRange, getTripDuration, STATUS_LABEL, STATUS_COLOR } from "@/lib/trip-utils";
import { useToggleFavoriteTrip } from "@/hooks/useTrips";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  hero?: boolean;
}

export function TripCard({ trip, hero = false }: TripCardProps) {
  const daysUntil = getDaysUntil(trip.start_date);
  const duration = getTripDuration(trip.start_date, trip.end_date);
  const { mutate: toggleFavorite } = useToggleFavoriteTrip();

  const countdownLabel =
    trip.status === "completed"
      ? "Completed"
      : trip.status === "active"
      ? "Ongoing"
      : daysUntil < 0
      ? "Today!"
      : daysUntil === 0
      ? "Tomorrow!"
      : `${daysUntil}d to go`;

  const countdownUrgent = trip.status === "planning" && daysUntil >= 0 && daysUntil <= 6;

  return (
    <Link href={`/trips/${trip.id}`} className="block h-full">
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 transition-colors hover:border-[var(--border-hover)]",
          hero ? "min-h-56" : "min-h-44"
        )}
      >
        {/* Cover: photo if available, otherwise color band */}
        {trip.cover_photo_url ? (
          <div className={cn("relative flex-shrink-0 overflow-hidden", hero ? "h-32" : "h-24")}>
            <img
              src={trip.cover_photo_url}
              alt={trip.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div
            className="h-10 flex-shrink-0"
            style={{ backgroundColor: trip.cover_color ?? '#C0533A' }}
          />
        )}

        {/* Favorite star button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(trip.id);
          }}
          className={cn(
            "absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full transition-all",
            trip.is_favorite
              ? "opacity-100 bg-black/20"
              : "opacity-0 group-hover:opacity-100 bg-black/10 hover:bg-black/20"
          )}
          aria-label={trip.is_favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "h-4 w-4 transition-colors",
              trip.is_favorite ? "fill-kincha text-kincha" : "fill-transparent text-white"
            )}
          />
        </button>

        {/* Card body */}
        <div className="flex flex-1 flex-col justify-between px-4 py-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-medium text-[var(--text-primary)]">{trip.name}</p>
              {trip.is_favorite && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-kincha text-kincha" />
              )}
            </div>
            <p className="truncate text-sm text-[var(--text-secondary)]">{trip.destination}</p>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
              <span className="truncate text-xs text-[var(--text-tertiary)]">
                {formatDateRange(trip.start_date, trip.end_date)}
              </span>
            </div>
            <span className={STATUS_COLOR[trip.status]}>{STATUS_LABEL[trip.status]}</span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[var(--text-tertiary)]">
              {duration} {duration === 1 ? "day" : "days"}
            </span>
            <span className={cn("font-medium", countdownUrgent ? "text-kincha" : "text-[var(--text-tertiary)]")}>
              {countdownLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
