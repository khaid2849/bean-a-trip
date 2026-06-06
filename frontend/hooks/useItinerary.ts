import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ActivityCreate, ActivityUpdate, ItineraryDay } from "@/types/itinerary";

const key = (tripId: string) => ["itinerary", tripId];

export function useItinerary(tripId: string) {
  return useQuery<ItineraryDay[]>({
    queryKey: key(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/itinerary`); return data; },
    enabled: !!tripId,
  });
}

export function useCreateDay(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => { const { data } = await api.post(`/trips/${tripId}/itinerary/days`, { date }); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdateDay(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dayId, date }: { dayId: string; date: string }) => {
      const { data } = await api.patch(`/trips/${tripId}/itinerary/days/${dayId}`, { date });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeleteDay(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dayId: string) => { await api.delete(`/trips/${tripId}/itinerary/days/${dayId}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
    onError: () => toast.error("Something went wrong"),
  });
}

export function useCreateActivity(tripId: string, dayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ActivityCreate) => { const { data } = await api.post(`/trips/${tripId}/itinerary/days/${dayId}/activities`, body); return data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Activity saved");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdateActivity(tripId: string, dayId: string, activityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ActivityUpdate) => { const { data } = await api.put(`/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`, body); return data; },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Activity saved");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeleteActivity(tripId: string, dayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: string) => { await api.delete(`/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Activity deleted");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useReorderActivities(tripId: string, dayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemIds: string[]) => { await api.patch(`/trips/${tripId}/itinerary/days/${dayId}/activities/reorder`, { item_ids: itemIds }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}
