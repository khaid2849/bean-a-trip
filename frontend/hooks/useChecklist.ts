import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChecklistItem, ChecklistItemCreate, ChecklistItemUpdate } from "@/types/checklist";

const key = (tripId: string) => ["checklist", tripId];

export function useChecklist(tripId: string) {
  return useQuery<ChecklistItem[]>({
    queryKey: key(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/checklist`); return data; },
    enabled: !!tripId,
    refetchInterval: 30000, // auto-refresh every 30s for shared checklist sync
  });
}

export function useCreateChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ChecklistItemCreate) => { const { data } = await api.post<ChecklistItem>(`/trips/${tripId}/checklist`, body); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useUpdateChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: ChecklistItemUpdate & { id: string }) => {
      const { data } = await api.patch<ChecklistItem>(`/trips/${tripId}/checklist/${id}`, body); return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useDeleteChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => { await api.delete(`/trips/${tripId}/checklist/${itemId}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}
