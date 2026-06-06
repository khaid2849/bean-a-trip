import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BookingFile, TripPhoto } from "@/types/photo";

// ── Trip Photos ────────────────────────────────────────────
const photoKey = (tripId: string) => ["photos", tripId];

export function usePhotos(tripId: string) {
  return useQuery<TripPhoto[]>({
    queryKey: photoKey(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/photos`); return data; },
    enabled: !!tripId,
  });
}

export function useUploadPhoto(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<TripPhoto>(`/trips/${tripId}/photos`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: photoKey(tripId) }),
  });
}

export function useDeletePhoto(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => { await api.delete(`/trips/${tripId}/photos/${photoId}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: photoKey(tripId) }),
  });
}

// ── Booking Files ──────────────────────────────────────────
const bookingFileKey = (tripId: string, bookingId: string) => ["booking-files", tripId, bookingId];

export function useBookingFiles(tripId: string, bookingId: string) {
  return useQuery<BookingFile[]>({
    queryKey: bookingFileKey(tripId, bookingId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/bookings/${bookingId}/files`); return data; },
    enabled: !!tripId && !!bookingId,
  });
}

export function useUploadBookingFile(tripId: string, bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<BookingFile>(`/trips/${tripId}/bookings/${bookingId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingFileKey(tripId, bookingId) }),
  });
}

export function useDeleteBookingFile(tripId: string, bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => { await api.delete(`/trips/${tripId}/bookings/${bookingId}/files/${fileId}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingFileKey(tripId, bookingId) }),
  });
}
