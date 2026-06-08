"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Settings, Palette, Zap, Wallet, Bookmark, MapPin,
  Sun, Moon, Monitor,
} from "lucide-react";
import { TypeManager } from "@/components/settings/TypeManager";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

type Section = "theme" | "activityTypes" | "expenseCategories" | "bookingTypes" | "placeTypes";

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "theme",            label: "Theme",              icon: Palette },
  { id: "activityTypes",    label: "Activity Types",     icon: Zap },
  { id: "expenseCategories",label: "Expense Categories", icon: Wallet },
  { id: "bookingTypes",     label: "Booking Types",      icon: Bookmark },
  { id: "placeTypes",       label: "Place Types",        icon: MapPin },
];

// ─── Theme section ────────────────────────────────────────────────────────────

function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { id: "light", label: "Light", icon: Sun,     desc: "Classic bright interface" },
    { id: "dark",  label: "Dark",  icon: Moon,    desc: "Easy on the eyes at night" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Theme</h3>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">Choose how BeanATrip looks for you.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map(({ id, label, icon: Icon, desc }) => {
          const active = mounted && theme === id;
          return (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all",
                active
                  ? "border-terracotta bg-terracotta-lt dark:bg-[#5A2318]"
                  : "border-[var(--border-default)] hover:border-[var(--border-hover)] bg-white dark:bg-sumi-100"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                active ? "bg-terracotta text-white" : "bg-washi-100 dark:bg-sumi-50 text-[var(--text-secondary)]"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className={cn("font-semibold text-sm", active ? "text-terracotta" : "text-[var(--text-primary)]")}>
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{desc}</p>
              </div>
              {active && (
                <span className="rounded-full bg-terracotta px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("theme");
  const {
    settings,
    updateActivityTypes,
    updateExpenseCategories,
    updateBookingTypes,
    updatePlaceTypes,
  } = useSettings();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-washi-100 dark:bg-sumi-100">
          <Settings className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-[var(--text-primary)]">Settings</h2>
          <p className="text-sm text-[var(--text-secondary)]">Customise BeanATrip to fit your workflow</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <aside className="w-52 shrink-0 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active === id
                  ? "bg-terracotta-lt dark:bg-[#5A2318] font-medium text-terracotta border-l-2 border-terracotta"
                  : "text-[var(--text-secondary)] hover:bg-washi-100 dark:hover:bg-sumi-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active === id ? "text-terracotta" : "text-[var(--text-tertiary)]")} />
              {label}
            </button>
          ))}
        </aside>

        {/* Content panel */}
        <div className="flex-1 min-w-0 rounded-2xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-6">
          {active === "theme" && <ThemeSection />}

          {active === "activityTypes" && (
            <SectionWrapper
              title="Activity Types"
              description="Types available when adding activities to your itinerary. Each type has its own color, icon, and name."
            >
              <TypeManager
                items={settings.activityTypes}
                onChange={updateActivityTypes}
                hasDescription
                hasColor
              />
            </SectionWrapper>
          )}

          {active === "expenseCategories" && (
            <SectionWrapper
              title="Expense Categories"
              description="Categories available in the expense form. Each category has its own color, icon, and name."
            >
              <TypeManager
                items={settings.expenseCategories}
                onChange={updateExpenseCategories}
                hasColor
                accentClass="bg-matcha hover:bg-matcha-mid text-white"
              />
            </SectionWrapper>
          )}

          {active === "bookingTypes" && (
            <SectionWrapper
              title="Booking Types"
              description="Types available when adding a booking (flight, hotel, etc.). Each type has its own color, icon, and name."
            >
              <TypeManager
                items={settings.bookingTypes}
                onChange={updateBookingTypes}
                hasColor
                accentClass="bg-kincha hover:bg-kincha-mid text-white"
              />
            </SectionWrapper>
          )}

          {active === "placeTypes" && (
            <SectionWrapper
              title="Place Types"
              description="Types available when saving a place (attraction, restaurant, etc.). Each type has its own color, icon, and name."
            >
              <TypeManager
                items={settings.placeTypes}
                onChange={updatePlaceTypes}
                hasColor
              />
            </SectionWrapper>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionWrapper({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {children}
    </div>
  );
}
