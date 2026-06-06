"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "./ExpenseForm";
import { useUpdateExpense } from "@/hooks/useExpenses";
import type { Expense } from "@/types/expense";

interface EditExpenseDialogProps {
  tripId: string;
  expense: Expense | null;
  onClose: () => void;
}

export function EditExpenseDialog({ tripId, expense, onClose }: EditExpenseDialogProps) {
  const { mutateAsync, isPending } = useUpdateExpense(tripId, expense?.id ?? "");

  if (!expense) return null;

  return (
    <Dialog open={!!expense} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit expense</DialogTitle></DialogHeader>
        <ExpenseForm
          defaultValues={expense}
          onSubmit={async (data) => { await mutateAsync(data); onClose(); }}
          isLoading={isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}
