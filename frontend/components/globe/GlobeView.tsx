"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { Trip, TripStatus } from "@/types/trip";
import { geocode, delay } from "@/lib/geocode";
import { TripTooltip } from "./TripPreviewPopup";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const PIN_COLOR: Record<TripStatus, string> = {
  planning:  "#3b82f6",
  active:    "#22c55e",
  completed: "#6b7280",
};

interface TripPoint extends Trip {
  lat: number;
  lng: number;
}

interface TooltipState {
  trip: TripPoint;
  x: number;
  y: number;
}

export function GlobeView({ trips }: { trips: Trip[] }) {
  const router       = useRouter();
  const globeRef     = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routerRef    = useRef(router);
  useEffect(() => { routerRef.current = router; }, [router]);

  const [width, setWidth]         = useState(800);
  const [points, setPoints]       = useState<TripPoint[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [tooltip, setTooltip]     = useState<TooltipState | null>(null);

  // Track container width for responsive canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    obs.observe(containerRef.current);
    setWidth(containerRef.current.getBoundingClientRect().width);
    return () => obs.disconnect();
  }, []);

  // Resolve lat/lng for each trip (stored values first, fall back to Nominatim)
  useEffect(() => {
    if (!trips.length) { setPoints([]); return; }

    let cancelled = false;

    async function resolve() {
      setIsGeocoding(true);
      const result: TripPoint[] = [];

      for (const trip of trips) {
        if (cancelled) break;
        if (trip.lat != null && trip.lng != null) {
          result.push({ ...trip, lat: trip.lat, lng: trip.lng });
        } else {
          const coords = await geocode(trip.destination);
          if (coords) result.push({ ...trip, ...coords });
          if (!cancelled) await delay(1100); // Nominatim: 1 req/sec
        }
      }

      if (!cancelled) {
        setPoints(result);
        setIsGeocoding(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [trips]);

  const onGlobeReady = useCallback(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.4;
    controls.minDistance     = 200;
    controls.maxDistance     = 600;
  }, []);

  const makeHtmlElement = useCallback((d: object) => {
    const trip  = d as TripPoint;
    const color = PIN_COLOR[trip.status];
    const el    = document.createElement("div");
    el.style.cssText = "cursor:pointer;transition:transform 0.15s ease;user-select:none;pointer-events:auto;";
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
        fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
        style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.55))">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="white" stroke="${color}" stroke-width="1.5"/>
      </svg>`;

    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.4) translateY(-3px)";
      if (globeRef.current) globeRef.current.controls().autoRotate = false;

      const container = containerRef.current;
      if (container) {
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        setTooltip({
          trip,
          x: eRect.left - cRect.left + eRect.width / 2,
          y: eRect.top  - cRect.top,
        });
      }
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
      if (globeRef.current) globeRef.current.controls().autoRotate = true;
      setTooltip(null);
    });

    el.addEventListener("click", () => {
      routerRef.current.push(`/trips/${trip.id}`);
    });

    return el;
  }, []); // globeRef, containerRef, routerRef are refs (stable); setTooltip is stable

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl bg-[#090d1f]" style={{ height: 560 }}>
      {isGeocoding && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
          Locating destinations…
        </div>
      )}

      <Globe
        ref={globeRef}
        width={width}
        height={560}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        htmlElementsData={points}
        htmlElement={makeHtmlElement}
        onGlobeReady={onGlobeReady}
        animateIn={false}
      />

      {tooltip && (
        <TripTooltip trip={tooltip.trip} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
