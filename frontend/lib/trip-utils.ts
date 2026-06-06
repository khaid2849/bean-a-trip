import type { TripStatus } from "@/types/trip";

export function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Append T00:00:00 so ISO date-only strings parse as local midnight, not UTC midnight.
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) - 1;
}

export function getTripDuration(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString("en", { ...opts, year: "numeric" })} – ${e.toLocaleDateString("en", { ...opts, year: "numeric" })}`;
  }
  return `${s.toLocaleDateString("en", opts)} – ${e.toLocaleDateString("en", { ...opts, year: "numeric" })}`;
}

export const STATUS_LABEL: Record<TripStatus, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
};

export const STATUS_COLOR: Record<TripStatus, string> = {
  planning: "bg-fuji-lt dark:bg-[#3D2840] text-fuji-dk dark:text-fuji-lt text-xs font-medium px-2 py-0.5 rounded-full",
  active: "bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt text-xs font-medium px-2 py-0.5 rounded-full",
  completed: "bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt text-xs font-medium px-2 py-0.5 rounded-full",
};

const DESTINATION_GRADIENTS = [
  "from-terracotta to-terracotta-mid",
  "from-matcha to-matcha-mid",
  "from-asagi to-asagi-mid",
  "from-fuji to-fuji-mid",
  "from-kincha to-kincha-mid",
  "from-washi-600 to-washi-400",
];

export function getDestinationGradient(destination: string): string {
  const hash = destination.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DESTINATION_GRADIENTS[hash % DESTINATION_GRADIENTS.length];
}

export const TRIP_COVER_COLORS = [
  '#C0533A', // Terracotta
  '#4A6741', // Matcha
  '#8B6B8A', // Fuji
  '#C48A3F', // Kincha
  '#4E7A8F', // Asagi
  '#9E8E7A', // Warm gray
  '#D97A62', // Terracotta mid
  '#7A9E72', // Matcha mid
];
