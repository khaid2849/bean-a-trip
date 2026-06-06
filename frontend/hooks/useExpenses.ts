import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { BudgetItem, Expense, ExpenseListResponse, ExpenseSummary } from "@/types/expense";

const key = (tripId: string) => ["expenses", tripId];

export function useExpenses(tripId: string) {
  return useQuery<ExpenseListResponse>({
    queryKey: key(tripId),
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/expenses`); return data; },
    enabled: !!tripId,
  });
}

export function useExpenseSummary(tripId: string) {
  return useQuery<ExpenseSummary>({
    queryKey: [...key(tripId), "summary"],
    queryFn: async () => { const { data } = await api.get(`/trips/${tripId}/expenses/summary`); return data; },
    enabled: !!tripId,
  });
}

export function useCreateBudget(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { category: string; planned_amount: number }) => { const { data } = await api.post<BudgetItem>(`/trips/${tripId}/expenses/budget`, body); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(tripId) }); },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdateBudget(tripId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { planned_amount: number }) => { const { data } = await api.put<BudgetItem>(`/trips/${tripId}/expenses/budget/${itemId}`, body); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(tripId) }); },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeleteBudget(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => { await api.delete(`/trips/${tripId}/expenses/budget/${itemId}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(tripId) }); },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useCreateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; amount: number; category: string; date: string; notes?: string }) => {
      const { data } = await api.post<Expense>(`/trips/${tripId}/expenses`, body); return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Expense added");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useUpdateExpense(tripId: string, expenseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<{ title: string; amount: number; category: string; date: string; notes: string }>) => {
      const { data } = await api.put<Expense>(`/trips/${tripId}/expenses/${expenseId}`, body); return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Expense updated");
    },
    onError: () => toast.error("Something went wrong"),
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: string) => { await api.delete(`/trips/${tripId}/expenses/${expenseId}`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(tripId) });
      toast.success("Expense deleted");
    },
    onError: () => toast.error("Something went wrong"),
  });
}
