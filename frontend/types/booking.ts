export type BookingType = string;
export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  trip_id: string;
  type: BookingType;
  title: string;
  confirmation_number: string | null;
  provider: string | null;
  check_in: string | null;
  check_out: string | null;
  amount: number | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface BookingCreate {
  type: BookingType;
  title: string;
  confirmation_number?: string;
  provider?: string;
  check_in?: string;
  check_out?: string;
  amount?: number;
  notes?: string;
  status?: BookingStatus;
}

export interface BookingUpdate extends Partial<BookingCreate> {}
