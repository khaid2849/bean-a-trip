"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/settings-store";
import type { AppSettings, ConfigItem } from "@/lib/settings-store";

interface SettingsContextValue {
  settings: AppSettings;
  updateActivityTypes:     (items: ConfigItem[]) => void;
  updateExpenseCategories: (items: ConfigItem[]) => void;
  updateBookingTypes:      (items: ConfigItem[]) => void;
  updatePlaceTypes:        (items: ConfigItem[]) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration (server renders with defaults)
  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  // Only persist after the initial localStorage load — never overwrite with defaults
  useEffect(() => {
    if (hydrated) saveSettings(settings);
  }, [settings, hydrated]);

  function updater(key: keyof AppSettings) {
    return (items: ConfigItem[]) =>
      setSettings(prev => ({ ...prev, [key]: items }));
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateActivityTypes:     updater("activityTypes"),
        updateExpenseCategories: updater("expenseCategories"),
        updateBookingTypes:      updater("bookingTypes"),
        updatePlaceTypes:        updater("placeTypes"),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
