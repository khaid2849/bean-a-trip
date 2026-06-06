"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TripForm } from "./TripForm";
import { useUpdateTrip, useUploadTripCoverPhoto, useDeleteTripCoverPhoto } from "@/hooks/useTrips";
import type { Trip, TripCreate } from "@/types/trip";

interface EditTripDialogProps {
  trip: Trip;
  iconOnly?: boolean;
}

export function EditTripDialog({ trip, iconOnly }: EditTripDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateTrip, isPending } = useUpdateTrip(trip.id);
  const { mutateAsync: uploadCoverPhoto, isPending: isUploading } = useUploadTripCoverPhoto(trip.id);
  const { mutateAsync: deleteCoverPhoto, isPending: isRemoving } = useDeleteTripCoverPhoto(trip.id);

  async function handleSubmit(data: TripCreate) {
    await updateTrip(data);
    setOpen(false);
  }

  return (
    <>
      {iconOnly ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit trip</DialogTitle>
          </DialogHeader>

          <TripForm
            defaultValues={{ ...trip, notes: trip.notes ?? undefined }}
            coverPhotoUrl={trip.cover_photo_url}
            onUploadCoverPhoto={async (file) => { await uploadCoverPhoto(file); }}
            onDeleteCoverPhoto={async () => { await deleteCoverPhoto(); }}
            isUploadingPhoto={isUploading}
            isRemovingPhoto={isRemoving}
            onSubmit={handleSubmit}
            isLoading={isPending}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
