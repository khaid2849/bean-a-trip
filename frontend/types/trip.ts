export type TripStatus = "planning" | "active" | "completed";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  cover_color: string;
  cover_photo_url: string | null;
  start_date: string;
  end_date: string;
  status: TripStatus;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripCreate {
  name: string;
  destination: string;
  cover_color?: string;
  start_date: string;
  end_date: string;
  status?: TripStatus;
  notes?: string;
}

export interface TripUpdate {
  name?: string;
  destination?: string;
  cover_color?: string;
  start_date?: string;
  end_date?: string;
  status?: TripStatus;
  notes?: string;
  is_favorite?: boolean;
}
