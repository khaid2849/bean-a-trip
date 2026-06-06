"use client";

import { Droplets, Wind, Thermometer, MapPin, RefreshCw } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";

const WMO: Record<number, { label: string; emoji: string; bg: string }> = {
  0:  { label: "Clear sky",            emoji: "☀️",  bg: "from-amber-50 to-sky-50 dark:from-amber-950/30 dark:to-sky-950/30" },
  1:  { label: "Mainly clear",         emoji: "🌤️",  bg: "from-amber-50 to-sky-50 dark:from-amber-950/30 dark:to-sky-950/30" },
  2:  { label: "Partly cloudy",        emoji: "⛅",  bg: "from-sky-50 to-slate-50 dark:from-sky-950/30 dark:to-slate-950/30" },
  3:  { label: "Overcast",             emoji: "☁️",  bg: "from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30" },
  45: { label: "Foggy",               emoji: "🌫️",  bg: "from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30" },
  48: { label: "Icy fog",             emoji: "🌫️",  bg: "from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30" },
  51: { label: "Light drizzle",       emoji: "🌦️",  bg: "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30" },
  53: { label: "Drizzle",             emoji: "🌦️",  bg: "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30" },
  55: { label: "Heavy drizzle",       emoji: "🌧️",  bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" },
  61: { label: "Slight rain",         emoji: "🌧️",  bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" },
  63: { label: "Rain",                emoji: "🌧️",  bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" },
  65: { label: "Heavy rain",          emoji: "🌧️",  bg: "from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50" },
  71: { label: "Slight snow",         emoji: "🌨️",  bg: "from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-950/30" },
  73: { label: "Snow",                emoji: "❄️",  bg: "from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-950/30" },
  75: { label: "Heavy snow",          emoji: "❄️",  bg: "from-slate-100 to-blue-100 dark:from-slate-900/50 dark:to-blue-950/50" },
  77: { label: "Snow grains",         emoji: "🌨️",  bg: "from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-950/30" },
  80: { label: "Slight showers",      emoji: "🌦️",  bg: "from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30" },
  81: { label: "Showers",             emoji: "🌧️",  bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" },
  82: { label: "Heavy showers",       emoji: "⛈️",  bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40" },
  85: { label: "Snow showers",        emoji: "🌨️",  bg: "from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-950/30" },
  86: { label: "Heavy snow showers",  emoji: "❄️",  bg: "from-slate-100 to-blue-100 dark:from-slate-900/50 dark:to-blue-950/50" },
  95: { label: "Thunderstorm",        emoji: "⛈️",  bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40" },
  96: { label: "Thunderstorm w/ hail",emoji: "⛈️",  bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40" },
  99: { label: "Severe thunderstorm", emoji: "⛈️",  bg: "from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60" },
};

function resolveWmo(code: number) {
  return WMO[code] ?? { label: "Unknown", emoji: "🌡️", bg: "from-washi-50 to-washi-100 dark:from-sumi-50 dark:to-sumi-100" };
}

interface WeatherWidgetProps {
  destination: string;
}

export function WeatherWidget({ destination }: WeatherWidgetProps) {
  const { data, isLoading, isError, refetch, isFetching } = useWeather(destination);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-50 px-5 py-4 h-28" />
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-[var(--border-default)] bg-washi-50 dark:bg-sumi-50 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
          Weather
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Could not load weather for <span className="font-medium">{destination}</span>.
        </p>
      </div>
    );
  }

  const wmo = resolveWmo(data.weatherCode);

  return (
    <div className={cn("rounded-2xl border border-[var(--border-default)] bg-gradient-to-br overflow-hidden", wmo.bg)}>
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
              Current weather
            </p>
            <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {data.location}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Refresh weather"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </button>
        </div>

        {/* Main row */}
        <div className="flex items-center gap-4">
          <span className="text-5xl leading-none select-none" role="img" aria-label={wmo.label}>
            {wmo.emoji}
          </span>
          <div>
            <p className="text-4xl font-bold tabular-nums leading-none text-[var(--text-primary)]">
              {data.temperature}{data.unit}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{wmo.label}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Thermometer className="h-3.5 w-3.5 text-terracotta" />
            Feels like {data.feelsLike}{data.unit}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Droplets className="h-3.5 w-3.5 text-asagi" />
            {data.humidity}% humidity
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Wind className="h-3.5 w-3.5 text-matcha" />
            {data.windSpeed} km/h wind
          </div>
        </div>
      </div>
    </div>
  );
}
