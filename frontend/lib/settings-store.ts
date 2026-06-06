export interface ConfigItem {
  id: string;       // stored value in DB (immutable after creation)
  name: string;     // display label
  icon: string;     // key from ICON_REGISTRY
  description?: string; // only used by activity types
}

export interface AppSettings {
  activityTypes: ConfigItem[];
  expenseCategories: ConfigItem[];
  bookingTypes: ConfigItem[];
  placeTypes: ConfigItem[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  activityTypes: [
    { id: "activity",      name: "Activity",       icon: "Zap" },
    { id: "food",          name: "Food",            icon: "UtensilsCrossed" },
    { id: "transport",     name: "Transport",       icon: "Truck" },
    { id: "accommodation", name: "Stay",            icon: "BedDouble" },
    { id: "photography",   name: "Photography",     icon: "Camera" },
    { id: "hiking",        name: "Hiking",          icon: "Mountain" },
    { id: "sports",        name: "Sports",          icon: "Dumbbell" },
    { id: "camping",       name: "Camping",         icon: "Tent" },
    { id: "sightseeing",   name: "Sightseeing",     icon: "Landmark" },
    { id: "gambling",      name: "Gambling",        icon: "Dice5" },
    { id: "other",         name: "Other",           icon: "Circle" },
  ],
  expenseCategories: [
    { id: "Food",          name: "Food",            icon: "UtensilsCrossed" },
    { id: "Transport",     name: "Transport",       icon: "Car" },
    { id: "Accommodation", name: "Accommodation",   icon: "BedDouble" },
    { id: "Activities",    name: "Activities",      icon: "Zap" },
    { id: "Shopping",      name: "Shopping",        icon: "ShoppingBag" },
    { id: "Other",         name: "Other",           icon: "Circle" },
  ],
  bookingTypes: [
    { id: "flight",  name: "Flight",  icon: "Plane" },
    { id: "hotel",   name: "Hotel",   icon: "Building2" },
    { id: "bus",     name: "Bus",     icon: "Bus" },
    { id: "train",   name: "Train",   icon: "Train" },
    { id: "ferry",   name: "Ferry",   icon: "Ship" },
    { id: "other",   name: "Other",   icon: "Package" },
  ],
  placeTypes: [
    { id: "attraction", name: "Attraction", icon: "Landmark" },
    { id: "restaurant", name: "Restaurant", icon: "UtensilsCrossed" },
    { id: "hotel",      name: "Hotel",      icon: "BedDouble" },
    { id: "cafe",       name: "Cafe",       icon: "Coffee" },
    { id: "shopping",   name: "Shopping",   icon: "ShoppingBag" },
    { id: "other",      name: "Other",      icon: "MapPin" },
  ],
};

const STORAGE_KEY = "beanatrip_settings_v1";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      activityTypes:     parsed.activityTypes     ?? DEFAULT_SETTINGS.activityTypes,
      expenseCategories: parsed.expenseCategories ?? DEFAULT_SETTINGS.expenseCategories,
      bookingTypes:      parsed.bookingTypes      ?? DEFAULT_SETTINGS.bookingTypes,
      placeTypes:        parsed.placeTypes        ?? DEFAULT_SETTINGS.placeTypes,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

/** Generate a slug id from a display name, ensuring uniqueness within a list */
export function makeId(name: string, existing: string[]): string {
  const base = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  let id = base || "type";
  let n = 2;
  while (existing.includes(id)) {
    id = `${base}-${n++}`;
  }
  return id;
}
