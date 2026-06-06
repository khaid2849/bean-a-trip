import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Trip, TripCreate, TripUpdate } from "@/types/trip";

const TRIPS_KEY = ["trips"];

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: TRIPS_KEY,
    queryFn: async () => {
      const { data } = await api.get("/trips");
      return data;
    },
  });
}

export function useTrip(id: string) {
  return useQuery<Trip>({
    queryKey: [...TRIPS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TripCreate) => {
      const { data } = await api.post<Trip>("/trips", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      toast.success("Trip created");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TripUpdate) => {
      const { data } = await api.put<Trip>(`/trips/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      qc.invalidateQueries({ queryKey: [...TRIPS_KEY, id] });
      toast.success("Trip updated");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trips/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      toast.success("Trip deleted");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useToggleFavoriteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<Trip>(`/trips/${id}/favorite`);
      return data;
    },
    onSuccess: (updatedTrip) => {
      qc.setQueryData<Trip[]>(TRIPS_KEY, (old) =>
        old?.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)) ?? [updatedTrip]
      );
      qc.setQueryData<Trip>([...TRIPS_KEY, updatedTrip.id], updatedTrip);
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUploadTripCoverPhoto(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<Trip>(`/trips/${tripId}/cover-photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (updatedTrip) => {
      // Immediately write the returned trip into both caches so the UI
      // updates before any background refetch completes.
      qc.setQueryData<Trip>([...TRIPS_KEY, tripId], updatedTrip);
      qc.setQueryData<Trip[]>(TRIPS_KEY, (old) =>
        old?.map((t) => (t.id === tripId ? updatedTrip : t)) ?? [updatedTrip]
      );
      toast.success("Cover photo updated");
    },
    onError: () => toast.error("Failed to upload cover photo"),
  });
}

export function useDeleteTripCoverPhoto(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<Trip>(`/trips/${tripId}/cover-photo`);
      return data;
    },
    onSuccess: (updatedTrip) => {
      qc.setQueryData<Trip>([...TRIPS_KEY, tripId], updatedTrip);
      qc.setQueryData<Trip[]>(TRIPS_KEY, (old) =>
        old?.map((t) => (t.id === tripId ? updatedTrip : t)) ?? [updatedTrip]
      );
      toast.success("Cover photo removed");
    },
    onError: () => toast.error("Failed to remove cover photo"),
  });
}
