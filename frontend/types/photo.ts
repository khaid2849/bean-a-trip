export interface TripPhoto {
  id: string;
  trip_id: string;
  file_name: string;
  caption: string;
  url: string;
  created_at: string;
}

export interface BookingFile {
  id: string;
  booking_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
}
