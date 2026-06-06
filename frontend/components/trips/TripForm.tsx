"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRIP_COVER_COLORS } from "@/lib/trip-utils";
import type { TripCreate, TripStatus } from "@/types/trip";
import { cn } from "@/lib/utils";

interface TripFormProps {
  defaultValues?: Partial<TripCreate>;
  coverPhotoUrl?: string | null;
  onUploadCoverPhoto?: (file: File) => Promise<void>;
  onDeleteCoverPhoto?: () => Promise<void>;
  isUploadingPhoto?: boolean;
  isRemovingPhoto?: boolean;
  onSubmit: (data: TripCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TripForm({
  defaultValues,
  coverPhotoUrl,
  onUploadCoverPhoto,
  onDeleteCoverPhoto,
  isUploadingPhoto,
  isRemovingPhoto,
  onSubmit,
  isLoading,
  submitLabel = "Create trip",
}: TripFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [destination, setDestination] = useState(defaultValues?.destination ?? "");
  const [startDate, setStartDate] = useState(defaultValues?.start_date ?? "");
  const [endDate, setEndDate] = useState(defaultValues?.end_date ?? "");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [color, setColor] = useState(defaultValues?.cover_color ?? TRIP_COVER_COLORS[0]);
  const [status, setStatus] = useState<TripStatus>(defaultValues?.status ?? "planning");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onUploadCoverPhoto) return;
    await onUploadCoverPhoto(file);
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, destination, cover_color: color, start_date: startDate, end_date: endDate, status, notes: notes || undefined });
  }

  const canManagePhoto = !!onUploadCoverPhoto;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cover preview */}
      {coverPhotoUrl ? (
        <div className="relative h-28 w-full overflow-hidden rounded-xl">
          <img src={coverPhotoUrl} alt="Cover" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {canManagePhoto && (
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="rounded-md bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60 disabled:opacity-50"
                title="Replace photo"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteCoverPhoto?.()}
                disabled={isRemovingPhoto}
                className="rounded-md bg-black/40 p-1.5 text-white transition-colors hover:bg-red-500/80 disabled:opacity-50"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "h-16 w-full overflow-hidden rounded-xl transition-colors",
            canManagePhoto && "cursor-pointer group relative"
          )}
          style={{ backgroundColor: color }}
          onClick={canManagePhoto ? () => fileInputRef.current?.click() : undefined}
        >
          {canManagePhoto && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 text-transparent transition-all group-hover:bg-black/20 group-hover:text-white text-xs font-medium">
              <ImageIcon className="h-3.5 w-3.5" />
              {isUploadingPhoto ? "Uploading…" : "Add cover photo"}
            </div>
          )}
        </div>
      )}

      {canManagePhoto && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      <div className="space-y-1.5">
        <Label>Trip name</Label>
        <Input placeholder="e.g. Japan Spring 2026" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Destination</Label>
        <Input placeholder="e.g. Tokyo, Japan" value={destination} onChange={e => setDestination(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Start date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>End date</Label>
          <Input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <div className="flex gap-2">
          {(["planning", "active", "completed"] as TripStatus[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cover color</Label>
        <div className="flex gap-2">
          {TRIP_COVER_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn("h-7 w-7 rounded-full border-2 transition-transform hover:scale-110", color === c ? "border-foreground scale-110" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
        <Input placeholder="Any notes about this trip…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
