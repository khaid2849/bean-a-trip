import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Booking, BookingCreate, BookingUpdate } from "@/types/booking";

const key = (tripId: string) => ["bookings", tripId];

export function useBookings(tripId: string) {
  return useQuery<Booking[]>({
    queryKey: key(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/bookings`); return data; },
    enabled: !!tripId,
  });
}

export function useCreateBooking(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BookingCreate) => { const { data } = await api.post<Booking>(`/trips/${tripId}/bookings`, body); return data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Booking saved");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdateBooking(tripId: string, bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BookingUpdate) => { const { data } = await api.put<Booking>(`/trips/${tripId}/bookings/${bookingId}`, body); return data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Booking updated");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeleteBooking(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => { await api.delete(`/trips/${tripId}/bookings/${bookingId}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Booking deleted");
    },
    onError: () => toast.error("Something went wrong"),
  });
}
