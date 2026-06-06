export const CHECKLIST_CATEGORIES = ["Packing", "Documents", "Preparation", "Other"] as const;
export type ChecklistCategory = typeof CHECKLIST_CATEGORIES[number];

export interface ChecklistItem {
  id: string;
  trip_id: string;
  title: string;
  is_checked: boolean;
  category: string;
  order_index: number;
  created_at: string;
}

export interface ChecklistItemCreate {
  title: string;
  category?: string;
  is_checked?: boolean;
}

export interface ChecklistItemUpdate {
  title?: string;
  category?: string;
  is_checked?: boolean;
}
