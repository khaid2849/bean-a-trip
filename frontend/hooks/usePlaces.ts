import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Place, PlaceCreate, PlaceUpdate } from "@/types/place";

const key = (tripId: string) => ["places", tripId];

export function usePlaces(tripId: string) {
  return useQuery<Place[]>({
    queryKey: key(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/places`); return data; },
    enabled: !!tripId,
  });
}

export function useCreatePlace(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PlaceCreate) => { const { data } = await api.post<Place>(`/trips/${tripId}/places`, body); return data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Place saved");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdatePlace(tripId: string, placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PlaceUpdate) => { const { data } = await api.put<Place>(`/trips/${tripId}/places/${placeId}`, body); return data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Place updated");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useToggleVisited(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (placeId: string) => { const { data } = await api.patch<Place>(`/trips/${tripId}/places/${placeId}/visited`); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeletePlace(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (placeId: string) => { await api.delete(`/trips/${tripId}/places/${placeId}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Place deleted");
    },
    onError: () => toast.error("Something went wrong"),
  });
}
