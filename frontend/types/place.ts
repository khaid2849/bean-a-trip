export type PlaceType = string;

export interface Place {
  id: string;
  trip_id: string;
  name: string;
  type: PlaceType;
  address: string | null;
  notes: string | null;
  rating: number | null;
  visited: boolean;
  created_at: string;
}

export interface PlaceCreate {
  name: string;
  type?: PlaceType;
  address?: string;
  notes?: string;
  rating?: number;
  visited?: boolean;
}

export interface PlaceUpdate extends Partial<PlaceCreate> {}
