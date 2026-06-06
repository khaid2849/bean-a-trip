export interface ActivityTypeConfig {
  accentColor: string;  // hex for card left-border accent (inline style)
  iconClass: string;    // Tailwind: bg + text for icon container
  badgeClass: string;   // Tailwind: bg + text for type badge
  label: string;
}

export const ACTIVITY_TYPE_CONFIG: Record<string, ActivityTypeConfig> = {
  activity: {
    accentColor: '#4E7A8F',
    iconClass: 'bg-asagi-lt dark:bg-[#102838] text-asagi dark:text-asagi-lt',
    badgeClass: 'bg-asagi-lt dark:bg-[#102838] text-asagi-dk dark:text-asagi-lt',
    label: 'Activity',
  },
  food: {
    accentColor: '#C0533A',
    iconClass: 'bg-terracotta-lt dark:bg-[#5A2318] text-terracotta dark:text-terracotta-lt',
    badgeClass: 'bg-terracotta-lt dark:bg-[#5A2318] text-terracotta-dk dark:text-terracotta-lt',
    label: 'Food',
  },
  transport: {
    accentColor: '#9E8E7A',
    iconClass: 'bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]',
    badgeClass: 'bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]',
    label: 'Transport',
  },
  accommodation: {
    accentColor: '#C48A3F',
    iconClass: 'bg-kincha-lt dark:bg-[#4A2E08] text-kincha dark:text-kincha-lt',
    badgeClass: 'bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt',
    label: 'Stay',
  },
  photography: {
    accentColor: '#8B6B8A',
    iconClass: 'bg-fuji-lt dark:bg-[#3D2840] text-fuji dark:text-fuji-lt',
    badgeClass: 'bg-fuji-lt dark:bg-[#3D2840] text-fuji-dk dark:text-fuji-lt',
    label: 'Photography',
  },
  hiking: {
    accentColor: '#4A6741',
    iconClass: 'bg-matcha-lt dark:bg-[#1E3A1A] text-matcha dark:text-matcha-lt',
    badgeClass: 'bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt',
    label: 'Hiking',
  },
  sports: {
    accentColor: '#4A6741',
    iconClass: 'bg-matcha-lt dark:bg-[#1E3A1A] text-matcha dark:text-matcha-lt',
    badgeClass: 'bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt',
    label: 'Sports',
  },
  camping: {
    accentColor: '#4A6741',
    iconClass: 'bg-matcha-lt dark:bg-[#1E3A1A] text-matcha dark:text-matcha-lt',
    badgeClass: 'bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt',
    label: 'Camping',
  },
  sightseeing: {
    accentColor: '#4E7A8F',
    iconClass: 'bg-asagi-lt dark:bg-[#102838] text-asagi dark:text-asagi-lt',
    badgeClass: 'bg-asagi-lt dark:bg-[#102838] text-asagi-dk dark:text-asagi-lt',
    label: 'Sightseeing',
  },
  gambling: {
    accentColor: '#9E8E7A',
    iconClass: 'bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]',
    badgeClass: 'bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]',
    label: 'Gambling',
  },
  other: {
    accentColor: '#9E8E7A',
    iconClass: 'bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]',
    badgeClass: 'bg-washi-100 dark:bg-sumi-100 text-washi-600 dark:text-[#A89882]',
    label: 'Other',
  },
};

export function getActivityTypeConfig(type: string): ActivityTypeConfig {
  return ACTIVITY_TYPE_CONFIG[type] ?? ACTIVITY_TYPE_CONFIG.other;
}
