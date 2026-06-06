import {
  // Transport
  Plane, Car, Truck, Train, Ship, Bus, Bike, Footprints, Sailboat,
  // Food & Drink
  UtensilsCrossed, Coffee, Wine, Pizza, IceCream2, Soup, Beer,
  // Accommodation
  BedDouble, Home, Building2, Tent, Castle,
  // Activities & Entertainment
  Zap, Dumbbell, Mountain, Camera, Dice5, Music2, Theater, Palette, Waves,
  Ticket, Film, Gamepad2,
  // Sightseeing & Nature
  Landmark, Map, Compass, Globe, TreePine, Flower, Leaf, Sun, Snowflake,
  // Shopping
  ShoppingBag, ShoppingCart, Store, Gift, Tag,
  // General
  Star, Heart, Flag, BookOpen, Clock, MapPin, Circle, Sunset, Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Transport
  Plane, Car, Truck, Train, Ship, Bus, Bike, Footprints, Sailboat,
  // Food & Drink
  UtensilsCrossed, Coffee, Wine, Pizza, IceCream2, Soup, Beer,
  // Accommodation
  BedDouble, Home, Building2, Tent, Castle,
  // Activities & Entertainment
  Zap, Dumbbell, Mountain, Camera, Dice5, Music2, Theater, Palette, Waves,
  Ticket, Film, Gamepad2,
  // Sightseeing & Nature
  Landmark, Map, Compass, Globe, TreePine, Flower, Leaf, Sun, Snowflake,
  // Shopping
  ShoppingBag, ShoppingCart, Store, Gift, Tag,
  // General
  Star, Heart, Flag, BookOpen, Clock, MapPin, Circle, Sunset, Package,
};

export type IconName = keyof typeof ICON_REGISTRY;

export const ALL_ICONS = Object.keys(ICON_REGISTRY) as IconName[];

export function getIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] ?? Circle;
}

/** Group labels for the icon picker UI */
export const ICON_GROUPS: { label: string; icons: IconName[] }[] = [
  {
    label: "Transport",
    icons: ["Plane", "Car", "Truck", "Train", "Ship", "Bus", "Bike", "Footprints", "Sailboat"],
  },
  {
    label: "Food & Drink",
    icons: ["UtensilsCrossed", "Coffee", "Wine", "Pizza", "IceCream2", "Soup", "Beer"],
  },
  {
    label: "Accommodation",
    icons: ["BedDouble", "Home", "Building2", "Tent", "Castle"],
  },
  {
    label: "Activities",
    icons: ["Zap", "Dumbbell", "Mountain", "Camera", "Dice5", "Music2", "Theater", "Palette", "Waves", "Ticket", "Film", "Gamepad2"],
  },
  {
    label: "Nature & Sights",
    icons: ["Landmark", "Map", "Compass", "Globe", "TreePine", "Flower", "Leaf", "Sun", "Snowflake", "Sunset"],
  },
  {
    label: "Shopping",
    icons: ["ShoppingBag", "ShoppingCart", "Store", "Gift", "Tag"],
  },
  {
    label: "General",
    icons: ["Star", "Heart", "Flag", "BookOpen", "Clock", "MapPin", "Circle", "Package"],
  },
];
