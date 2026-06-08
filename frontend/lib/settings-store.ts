export interface ConfigItem {
  id: string;       // stored value in DB (immutable after creation)
  name: string;     // display label
  icon: string;     // key from ICON_REGISTRY
  color?: string;   // hex accent color — only used by activity types
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
    { id: "activity",      name: "Activity",       icon: "Zap",            color: "#4E7A8F" },
    { id: "food",          name: "Food",            icon: "UtensilsCrossed",color: "#C0533A" },
    { id: "transport",     name: "Transport",       icon: "Truck",          color: "#9E8E7A" },
    { id: "accommodation", name: "Stay",            icon: "BedDouble",      color: "#C48A3F" },
    { id: "photography",   name: "Photography",     icon: "Camera",         color: "#8B6B8A" },
    { id: "hiking",        name: "Hiking",          icon: "Mountain",       color: "#4A6741" },
    { id: "sports",        name: "Sports",          icon: "Dumbbell",       color: "#3A7A6A" },
    { id: "camping",       name: "Camping",         icon: "Tent",           color: "#6B7A3A" },
    { id: "sightseeing",   name: "Sightseeing",     icon: "Landmark",       color: "#4E6A8F" },
    { id: "gambling",      name: "Gambling",        icon: "Dice5",          color: "#8F4E6A" },
    { id: "other",         name: "Other",           icon: "Circle",         color: "#9E8E7A" },
  ],
  expenseCategories: [
    { id: "Food",          name: "Food",          icon: "UtensilsCrossed", color: "#C0533A" },
    { id: "Transport",     name: "Transport",     icon: "Car",             color: "#4E7A8F" },
    { id: "Accommodation", name: "Accommodation", icon: "BedDouble",       color: "#C48A3F" },
    { id: "Activities",    name: "Activities",    icon: "Zap",             color: "#8B6B8A" },
    { id: "Shopping",      name: "Shopping",      icon: "ShoppingBag",     color: "#4A6741" },
    { id: "Other",         name: "Other",         icon: "Circle",          color: "#9E8E7A" },
  ],
  bookingTypes: [
    { id: "flight", name: "Flight", icon: "Plane",    color: "#4E7A8F" },
    { id: "hotel",  name: "Hotel",  icon: "Building2", color: "#C48A3F" },
    { id: "bus",    name: "Bus",    icon: "Bus",       color: "#4A6741" },
    { id: "train",  name: "Train",  icon: "Train",     color: "#8B6B8A" },
    { id: "ferry",  name: "Ferry",  icon: "Ship",      color: "#3A7A6A" },
    { id: "other",  name: "Other",  icon: "Package",   color: "#9E8E7A" },
  ],
  placeTypes: [
    { id: "attraction", name: "Attraction", icon: "Landmark",       color: "#4E7A8F" },
    { id: "restaurant", name: "Restaurant", icon: "UtensilsCrossed",color: "#C0533A" },
    { id: "hotel",      name: "Hotel",      icon: "BedDouble",      color: "#C48A3F" },
    { id: "cafe",       name: "Cafe",       icon: "Coffee",         color: "#8B6B8A" },
    { id: "shopping",   name: "Shopping",   icon: "ShoppingBag",    color: "#4A6741" },
    { id: "other",      name: "Other",      icon: "MapPin",         color: "#9E8E7A" },
  ],
};

const STORAGE_KEY = "beanatrip_settings_v1";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    function backfillColors(items: ConfigItem[], defaults: ConfigItem[]): ConfigItem[] {
      return (items ?? defaults).map(item => {
        if (item.color) return item;
        const def = defaults.find(d => d.id === item.id);
        return def?.color ? { ...item, color: def.color } : item;
      });
    }
    return {
      activityTypes:     backfillColors(parsed.activityTypes     ?? DEFAULT_SETTINGS.activityTypes,     DEFAULT_SETTINGS.activityTypes),
      expenseCategories: backfillColors(parsed.expenseCategories ?? DEFAULT_SETTINGS.expenseCategories, DEFAULT_SETTINGS.expenseCategories),
      bookingTypes:      backfillColors(parsed.bookingTypes      ?? DEFAULT_SETTINGS.bookingTypes,      DEFAULT_SETTINGS.bookingTypes),
      placeTypes:        backfillColors(parsed.placeTypes        ?? DEFAULT_SETTINGS.placeTypes,        DEFAULT_SETTINGS.placeTypes),
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
