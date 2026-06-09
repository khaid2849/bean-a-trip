"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateRange } from "@/lib/trip-utils";
import type { Trip } from "@/types/trip";

const STATUS_BADGE: Record<Trip["status"], string> = {
  planning:  "bg-blue-100  text-blue-700",
  active:    "bg-green-100 text-green-700",
  completed: "bg-gray-100  text-gray-600",
};

const STATUS_LABEL: Record<Trip["status"], string> = {
  planning:  "Planning",
  active:    "Active",
  completed: "Completed",
};

interface TripTooltipProps {
  trip: Trip;
  x: number; // center-x of pin relative to container
  y: number; // top-y of pin relative to container
}

export function TripTooltip({ trip, x, y }: TripTooltipProps) {
  return (
    <div
      className="absolute z-30 w-52 pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: "translateX(-50%) translateY(calc(-100% - 14px))",
      }}
    >
      <div className="animate-in fade-in zoom-in-95 duration-150 rounded-xl border border-white/20 bg-white/95 dark:bg-sumi-100/95 shadow-xl backdrop-blur-md overflow-hidden">
        {/* Color strip */}
        <div className="h-1.5 w-full" style={{ backgroundColor: trip.cover_color }} />

        <div className="px-3 py-2.5 space-y-1.5">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">
            {trip.name}
          </p>

          <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)] truncate">
            <MapPin className="h-3 w-3 shrink-0 text-[var(--text-tertiary)]" />
            {trip.destination}
          </p>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
              {formatDateRange(trip.start_date, trip.end_date)}
            </span>
            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_BADGE[trip.status])}>
              {STATUS_LABEL[trip.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div
        className="mx-auto w-2.5 h-2.5 rotate-45 -mt-1.5 rounded-sm border-r border-b border-white/20 bg-white/95 dark:bg-sumi-100/95"
        style={{ width: 10, height: 10 }}
      />
    </div>
  );
}
