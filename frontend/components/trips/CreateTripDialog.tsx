"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TripForm } from "./TripForm";
import { useCreateTrip } from "@/hooks/useTrips";
import type { TripCreate } from "@/types/trip";

export function CreateTripDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateTrip();

  async function handleSubmit(data: TripCreate) {
    const trip = await mutateAsync(data);
    setOpen(false);
    router.push(`/trips/${trip.id}`);
  }

  return (
    <>
      <Button
        className="gap-2 bg-terracotta hover:bg-terracotta-mid dark:bg-terracotta dark:hover:bg-terracotta-mid text-white font-medium rounded-lg transition-colors"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" /> New trip
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new trip</DialogTitle>
          </DialogHeader>
          <TripForm onSubmit={handleSubmit} isLoading={isPending} />
        </DialogContent>
      </Dialog>
    </>
  );
}
