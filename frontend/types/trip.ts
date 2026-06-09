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
  currency: string;
  lat: number | null;
  lng: number | null;
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
  currency?: string;
  lat?: number | null;
  lng?: number | null;
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
  currency?: string;
  lat?: number | null;
  lng?: number | null;
}
