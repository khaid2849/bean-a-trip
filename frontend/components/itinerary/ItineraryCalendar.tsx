"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendar.css";
import type { ItineraryDay, Activity } from "@/types/itinerary";
import { TYPE_ICON } from "./ActivityCard";
import { getIcon } from "@/lib/icon-registry";
import { useSettings } from "@/context/SettingsContext";
import type { ActivityType } from "@/types/itinerary";
import { Circle } from "lucide-react";

// ── Color system (matches ActivityCard left-border palette) ───────────────
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  transport:     { bg: "#4c1d95", border: "#7c3aed", text: "#ede9fe" },
  food:          { bg: "#78350f", border: "#d97706", text: "#fef3c7" },
  accommodation: { bg: "#064e3b", border: "#059669", text: "#d1fae5" },
  activity:      { bg: "#1e3a5f", border: "#3b82f6", text: "#dbeafe" },
  photography:   { bg: "#831843", border: "#ec4899", text: "#fce7f3" },
  hiking:        { bg: "#14532d", border: "#22c55e", text: "#dcfce7" },
  sports:        { bg: "#14532d", border: "#22c55e", text: "#dcfce7" },
  camping:       { bg: "#14532d", border: "#22c55e", text: "#dcfce7" },
  sightseeing:   { bg: "#1e3a5f", border: "#3b82f6", text: "#dbeafe" },
  gambling:      { bg: "#1f2937", border: "#4b5563", text: "#d1d5db" },
  other:         { bg: "#1f2937", border: "#4b5563", text: "#d1d5db" },
};

function getCalendarEventColor(types: string[]) {
  const primary = types[0] ?? "other";
  return TYPE_COLORS[primary] ?? TYPE_COLORS.other;
}

interface ItineraryCalendarProps {
  days: ItineraryDay[];
  onDayClick?: (dayId: string) => void;
  onEditActivity?: (activity: Activity) => void;
}

export default function ItineraryCalendar({ days, onDayClick, onEditActivity }: ItineraryCalendarProps) {
  const { settings } = useSettings();
  const events = days.flatMap(day =>
    day.activities.map(activity => {
      const color = getCalendarEventColor(activity.types);
      return {
        id: activity.id,
        title: activity.title,
        start: `${day.date}T${activity.start_time || "00:00"}`,
        end: activity.end_time ? `${day.date}T${activity.end_time}` : undefined,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        extendedProps: { activity, dayId: day.id },
      };
    })
  );

  // Subtle background tint for days that have activities
  const dayHighlights = days.map(day => ({
    start: day.date,
    display: "background",
    backgroundColor: "hsl(199 89% 48% / 0.06)",
  }));

  return (
    <div className="rounded-2xl border bg-card p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ start: "prev,next today", center: "title", end: "dayGridMonth,timeGridWeek" }}
        events={[...events, ...dayHighlights]}
        height="auto"
        dayMaxEvents={4}
        initialDate={days[0]?.date}
        eventDisplay="block"
        eventContent={(arg) => {
          const activity = arg.event.extendedProps.activity as Activity | undefined;
          if (!activity) return null;
          const primaryType = activity.types?.[0] ?? "other";
          const settingsType = settings.activityTypes.find(t => t.id === primaryType);
          const Icon = settingsType ? getIcon(settingsType.icon) : (TYPE_ICON[primaryType as ActivityType] ?? Circle);
          const isDone = activity.status === "done";
          const isSkipped = activity.status === "skipped";
          const timeStr = activity.start_time
            ? new Date(`1970-01-01T${activity.start_time}`).toLocaleTimeString("en", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "";
          return (
            <div
              className="flex items-center gap-1 overflow-hidden px-1 py-0.5"
              style={{ opacity: isSkipped ? 0.4 : 1 }}
            >
              <Icon className="shrink-0 h-2.5 w-2.5" />
              <span className="truncate text-[11px] font-medium leading-none">
                {timeStr && (
                  <span className="mr-1 opacity-75">{timeStr}</span>
                )}
                <span style={{ textDecoration: isDone ? "line-through" : "none" }}>
                  {arg.event.title}
                </span>
              </span>
            </div>
          );
        }}
        eventClick={(info) => {
          const activity = info.event.extendedProps.activity as Activity;
          if (onEditActivity) {
            info.jsEvent.preventDefault();
            onEditActivity(activity);
          } else {
            const dayId = info.event.extendedProps.dayId;
            if (dayId && onDayClick) onDayClick(dayId);
          }
        }}
        dateClick={(info) => {
          const day = days.find(d => d.date === info.dateStr);
          if (day && onDayClick) onDayClick(day.id);
        }}
      />
    </div>
  );
}
