"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlaces, useCreatePlace, useUpdatePlace, useToggleVisited, useDeletePlace } from "@/hooks/usePlaces";
import { useSettings } from "@/context/SettingsContext";
import { getIcon } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import type { Place, PlaceCreate } from "@/types/place";


function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={cn(
            "transition-colors",
            i <= rating ? "text-kincha" : "text-washi-200 dark:text-sumi-50",
            onChange ? "hover:text-kincha-mid" : "cursor-default"
          )}
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
      ))}
    </div>
  );
}

function PlaceForm({ defaultValues, onSubmit, isLoading, submitLabel = "Add place" }: {
  defaultValues?: Partial<Place>;
  onSubmit: (d: PlaceCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}) {
  const { settings } = useSettings();
  const placeTypes = settings.placeTypes;

  const [name,       setName]       = useState(defaultValues?.name ?? "");
  const [type,       setType]       = useState(defaultValues?.type ?? placeTypes[0]?.id ?? "attraction");
  const [address,    setAddress]    = useState(defaultValues?.address ?? "");
  const [mapPreview, setMapPreview] = useState(defaultValues?.address ?? "");
  const [rating,     setRating]     = useState(defaultValues?.rating ?? 0);
  const [notes,      setNotes]      = useState(defaultValues?.notes ?? "");
  const [visited,    setVisited]    = useState(defaultValues?.visited ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, type, address: address || undefined, rating: rating || undefined, notes: notes || undefined, visited });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input placeholder="e.g. Senso-ji Temple" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {placeTypes.map(t => {
            const Icon = getIcon(t.icon);
            const active = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
                style={active && t.color
                  ? { borderColor: t.color, backgroundColor: `${t.color}18`, color: t.color }
                  : { borderColor: "var(--border-default)", color: "var(--text-secondary)" }
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Address <span className="text-[var(--text-tertiary)]">(optional)</span></Label>
        <Input
          placeholder="Enter address or area"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onBlur={() => setMapPreview(address)}
        />
        {mapPreview && (
          <div className="overflow-hidden rounded-lg border border-[var(--border-default)]" style={{ height: 180 }}>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapPreview)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location preview"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <Label>Notes <span className="text-[var(--text-tertiary)]">(optional)</span></Label>
        <Input placeholder="Any notes…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setVisited(v => !v)}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
            visited ? "border-matcha bg-matcha" : "border-[var(--border-hover)]"
          )}
        >
          {visited && <Check className="h-3 w-3 text-white" />}
        </button>
        <Label className="cursor-pointer" onClick={() => setVisited(v => !v)}>Mark as visited</Label>
      </div>

      <Button type="submit" className="w-full bg-terracotta hover:bg-terracotta-mid text-white font-medium" disabled={isLoading}>
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function EditPlaceDialog({ tripId, place, onClose }: { tripId: string; place: Place | null; onClose: () => void }) {
  const { mutateAsync, isPending } = useUpdatePlace(tripId, place?.id ?? "");
  if (!place) return null;
  return (
    <Dialog open={!!place} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit place</DialogTitle></DialogHeader>
        <PlaceForm defaultValues={place} onSubmit={async d => { await mutateAsync(d); onClose(); }} isLoading={isPending} submitLabel="Save changes" />
      </DialogContent>
    </Dialog>
  );
}

export default function PlacesPage({ params }: { params: { id: string } }) {
  const { id: tripId } = params;
  const { data: places = [], isLoading } = usePlaces(tripId);
  const { mutateAsync: createPlace, isPending: isCreating } = useCreatePlace(tripId);
  const { mutateAsync: toggleVisited } = useToggleVisited(tripId);
  const { mutateAsync: deletePlace } = useDeletePlace(tripId);
  const { settings } = useSettings();
  const placeTypes = settings.placeTypes;

  const [addOpen,    setAddOpen]    = useState(false);
  const [editPlace,  setEditPlace]  = useState<Place | null>(null);
  const [filter,     setFilter]     = useState<string>("all");

  const filtered = filter === "all" ? places : places.filter(p => p.type === filter);
  const visitedCount = places.filter(p => p.visited).length;
  const pct = places.length > 0 ? Math.round((visitedCount / places.length) * 100) : 0;

  function getTypeName(typeId: string) {
    return placeTypes.find(t => t.id === typeId)?.name ?? typeId;
  }
  function getTypeIcon(typeId: string) {
    const cfg = placeTypes.find(t => t.id === typeId);
    return getIcon(cfg?.icon ?? "MapPin");
  }
  function getTypeColor(typeId: string) {
    return placeTypes.find(t => t.id === typeId)?.color ?? "#9E8E7A";
  }

  // All type ids that appear in places data — settings order + unknown at end
  const filterTypes = [
    ...placeTypes.map(t => t.id).filter(id => places.some(p => p.type === id)),
    ...Array.from(new Set(places.map(p => p.type))).filter(id => !placeTypes.find(t => t.id === id)),
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-medium text-[var(--text-primary)]">Places</h2>
              <span className="rounded-full bg-washi-100 dark:bg-sumi-100 px-2 py-0.5 text-xs text-[var(--text-tertiary)]">
                {places.length} {places.length === 1 ? "place" : "places"}
              </span>
            </div>
            {places.length > 0 && (
              <div>
                <p className="mb-1 text-sm text-[var(--text-secondary)]">
                  visited {visitedCount} of {places.length} ·{" "}
                  <span className="font-medium text-matcha">{pct}%</span>
                </p>
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-washi-100 dark:bg-sumi-50">
                  <div className="h-full rounded-full bg-matcha transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          className="inline-flex shrink-0 self-end items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-mid sm:self-auto"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add place
        </button>
      </div>

      {/* Category filter chips */}
      {places.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm capitalize transition-colors",
              filter === "all"
                ? "border-terracotta-mid bg-terracotta-lt dark:bg-[#5A2318] text-terracotta-dk dark:text-terracotta-lt"
                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-terracotta-mid hover:text-terracotta"
            )}
          >
            All
          </button>
          {filterTypes.map(typeId => {
            const Icon = getTypeIcon(typeId);
            const active = filter === typeId;
            const color = getTypeColor(typeId);
            return (
              <button
                key={typeId}
                onClick={() => setFilter(typeId)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm capitalize transition-all"
                style={active
                  ? { borderColor: color, backgroundColor: `${color}18`, color, fontWeight: 500 }
                  : { borderColor: "var(--border-default)", color: "var(--text-secondary)" }
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {getTypeName(typeId)}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-washi-100 dark:bg-sumi-100" />)}
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <MapPin className="h-12 w-12 text-[var(--text-tertiary)]" />
          <div>
            <p className="text-lg font-medium text-[var(--text-primary)]">No places saved yet</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Save attractions, restaurants, and hotels you want to visit</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-mid"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add place
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No {getTypeName(filter)} places saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map(place => {
            const Icon = getTypeIcon(place.type);
            return (
              <div
                key={place.id}
                className={cn(
                  "group relative rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4 transition-colors hover:border-terracotta-mid",
                  place.visited && "opacity-75"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${getTypeColor(place.type)}18`, color: getTypeColor(place.type) }}
                  >
                    <Icon className="h-3 w-3" />
                    {getTypeName(place.type)}
                  </span>
                  <button
                    onClick={() => toggleVisited(place.id)}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      place.visited
                        ? "border-matcha bg-matcha-lt dark:bg-[#1E3A1A] text-matcha"
                        : "border-[var(--border-hover)] hover:border-matcha"
                    )}
                  >
                    {place.visited && <Check className="h-3.5 w-3.5 text-matcha" />}
                  </button>
                </div>

                <p className={cn(
                  "mt-2 font-medium text-base leading-snug",
                  place.visited ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                )}>
                  {place.name}
                </p>

                {place.address && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--text-secondary)] line-clamp-1">
                    <MapPin className="h-3 w-3 shrink-0" /> {place.address}
                  </p>
                )}

                {place.notes && (
                  <p className="mt-1 text-xs text-[var(--text-tertiary)] line-clamp-2">{place.notes}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  {(place.rating ?? 0) > 0 ? <StarRating rating={place.rating ?? 0} /> : <span />}
                  <div className="flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" onClick={() => setEditPlace(place)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-danger)]" onClick={() => deletePlace(place.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add place</DialogTitle></DialogHeader>
          <PlaceForm onSubmit={async d => { await createPlace(d); setAddOpen(false); }} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
      <EditPlaceDialog tripId={tripId} place={editPlace} onClose={() => setEditPlace(null)} />
    </div>
  );
}
