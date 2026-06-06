import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Note, NoteCreate, NoteUpdate } from "@/types/note";

const key = (tripId: string) => ["notes", tripId];

export function useNotes(tripId: string) {
  return useQuery<Note[]>({
    queryKey: key(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/notes`); return data; },
    enabled: !!tripId,
  });
}

export function useCreateNote(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NoteCreate) => { const { data } = await api.post<Note>(`/trips/${tripId}/notes`, body); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useUpdateNote(tripId: string, noteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NoteUpdate) => { const { data } = await api.put<Note>(`/trips/${tripId}/notes/${noteId}`, body); return data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export function useDeleteNote(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => { await api.delete(`/trips/${tripId}/notes/${noteId}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}
