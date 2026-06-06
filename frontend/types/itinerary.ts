export type ActivityType = string;

export type ActivityStatus = "planned" | "done" | "skipped";

export interface Activity {
  id: string;
  day_id: string;
  trip_id: string;
  title: string;
  types: ActivityType[];
  start_time: string | null;
  end_time: string | null;
  map_link: string | null;
  notes: string | null;
  order_index: number;
  status: ActivityStatus;
  created_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  date: string;
  day_number: number;
  activities: Activity[];
  created_at: string;
}

export interface ActivityCreate {
  title: string;
  types?: ActivityType[];
  start_time?: string;
  end_time?: string;
  map_link?: string;
  notes?: string;
  status?: ActivityStatus;
}

export interface ActivityUpdate {
  title?: string;
  types?: ActivityType[];
  start_time?: string | null;
  end_time?: string | null;
  map_link?: string | null;
  notes?: string | null;
  status?: ActivityStatus;
}
