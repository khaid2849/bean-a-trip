"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Grid3X3, AlignLeft,
  Upload, Trash2, ImageIcon, Pencil, X,
  Plus, FileText, ChevronLeft, ChevronRight, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTrip } from "@/hooks/useTrips";
import { usePhotos, useUploadPhoto, useDeletePhoto } from "@/hooks/usePhotos";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { TripPhoto } from "@/types/photo";
import type { Note } from "@/types/note";

// ─── Photo Lightbox ────────────────────────────────────────────────────────
function PhotoLightbox({
  initialPhoto,
  photos,
  tripId,
  onClose,
  onDelete,
}: {
  initialPhoto: TripPhoto;
  photos: TripPhoto[];
  tripId: string;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const qc = useQueryClient();
  const [current, setCurrent] = useState(initialPhoto);
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(initialPhoto.caption);

  const idx = photos.findIndex(p => p.id === current.id);
  const canPrev = idx > 0;
  const canNext = idx < photos.length - 1;

  const navigate = useCallback((dir: -1 | 1) => {
    const next = photos[idx + dir];
    if (next) { setCurrent(next); setCaption(next.caption); setEditingCaption(false); }
  }, [idx, photos]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  async function saveCaption() {
    await api.patch(`/trips/${tripId}/photos/${current.id}/caption`, null, { params: { caption } });
    qc.invalidateQueries({ queryKey: ["photos", tripId] });
    setCurrent(prev => ({ ...prev, caption }));
    setEditingCaption(false);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* ── Photo side ─────────────────────────────── */}
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[260px] sm:min-h-[480px]">
            <img
              key={current.id}
              src={current.url}
              alt={current.caption || current.file_name}
              className="max-h-[55vh] sm:max-h-[80vh] w-full object-contain"
            />
            {canPrev && (
              <button
                onClick={() => navigate(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {canNext && (
              <button
                onClick={() => navigate(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ── Details side ───────────────────────────── */}
          <div className="w-full sm:w-72 flex flex-col border-t sm:border-t-0 sm:border-l border-[var(--border-default)] bg-white dark:bg-sumi-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                {new Date(current.created_at).toLocaleDateString("en", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </p>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-danger)]"
                  onClick={async () => {
                    if (!confirm("Delete this photo?")) return;
                    await onDelete(current.id);
                    onClose();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--text-tertiary)]" onClick={onClose}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Caption */}
            <div className="flex-1 p-4">
              {editingCaption ? (
                <div className="space-y-2">
                  <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Write a caption…"
                    autoFocus
                    className="w-full text-sm text-[var(--text-primary)] bg-transparent border border-[var(--border-default)] rounded-lg p-2 resize-none min-h-[100px] focus:outline-none focus:border-[var(--border-hover)]"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-terracotta hover:bg-terracotta-mid text-white"
                      onClick={saveCaption}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setEditingCaption(false); setCaption(current.caption); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="group cursor-pointer" onClick={() => setEditingCaption(true)}>
                  {current.caption ? (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {current.caption}
                    </p>
                  ) : (
                    <p className="text-sm italic text-[var(--text-tertiary)]">
                      Add a caption…
                    </p>
                  )}
                  <Pencil className="h-3 w-3 text-[var(--text-tertiary)] mt-2 opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>
              )}
            </div>

            {/* Footer counter */}
            <div className="px-4 py-3 border-t border-[var(--border-default)]">
              <p className="text-center text-xs text-[var(--text-tertiary)] tabular-nums">
                {idx + 1} / {photos.length}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Note editor dialog ────────────────────────────────────────────────────
function NoteEditorDialog({
  tripId, note, onClose,
}: {
  tripId: string; note: Note | null; onClose: () => void;
}) {
  const { mutateAsync: updateNote, isPending } = useUpdateNote(tripId, note?.id ?? "");
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  if (!note) return null;
  return (
    <Dialog open={!!note} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="sr-only">Edit entry</DialogTitle></DialogHeader>
        <div className="space-y-2 pt-1">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry title"
            className="w-full bg-transparent text-lg font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-none outline-none focus:ring-0"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your thoughts…"
            className="w-full min-h-[220px] resize-none bg-transparent leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-none outline-none focus:ring-0 text-sm"
          />
        </div>
        <div className="flex gap-2 border-t border-[var(--border-default)] pt-3">
          <Button
            className="flex-1"
            onClick={async () => { await updateNote({ title, content }); onClose(); }}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create entry dialog ───────────────────────────────────────────────────
function CreateNoteDialog({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const { mutateAsync: createNote, isPending } = useCreateNote(tripId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(true);
  function handleClose() { setOpen(false); onClose(); }
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="sr-only">New entry</DialogTitle></DialogHeader>
        <div className="space-y-2 pt-1">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry title"
            autoFocus
            className="w-full bg-transparent text-lg font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-none outline-none focus:ring-0"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your thoughts…"
            className="w-full min-h-[220px] resize-none bg-transparent leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-none outline-none focus:ring-0 text-sm"
          />
        </div>
        <div className="flex gap-2 border-t border-[var(--border-default)] pt-3">
          <Button
            className="flex-1"
            disabled={isPending || !title.trim()}
            onClick={async () => { await createNote({ title, content }); handleClose(); }}
          >
            {isPending ? "Saving…" : "Save entry"}
          </Button>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function JournalsPage({ params }: { params: { id: string } }) {
  const { id: tripId } = params;
  const { data: trip } = useTrip(tripId);
  const { data: photos = [], isLoading: photosLoading } = usePhotos(tripId);
  const { data: notes = [], isLoading: notesLoading } = useNotes(tripId);
  const { mutateAsync: uploadPhoto, isPending: isUploading } = useUploadPhoto(tripId);
  const { mutateAsync: deletePhoto } = useDeletePhoto(tripId);
  const { mutateAsync: deleteNote } = useDeleteNote(tripId);
  const inputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"photos" | "entries">("photos");
  const [lightbox, setLightbox] = useState<TripPhoto | null>(null);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) await uploadPhoto(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-0">
      {/* Back */}
      <div className="pb-4">
        <Link href={`/trips/${tripId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Trip overview
          </Button>
        </Link>
      </div>

      {/* ── Profile header ──────────────────────────────────────────────────── */}
      <div className="pb-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          {trip?.name ?? "Journal"}
        </h2>
        {trip?.destination && (
          <p className="flex items-center gap-1 mt-0.5 text-xs text-[var(--text-tertiary)]">
            <MapPin className="h-3 w-3" /> {trip.destination}
          </p>
        )}

        {/* Stats row */}
        <div className="flex gap-6 mt-3">
          <div>
            <span className="text-sm font-bold text-[var(--text-primary)]">{photos.length}</span>
            <span className="ml-1 text-xs text-[var(--text-tertiary)]">photos</span>
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--text-primary)]">{notes.length}</span>
            <span className="ml-1 text-xs text-[var(--text-tertiary)]">entries</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-washi-100 dark:bg-sumi-100 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? "Uploading…" : "Add photos"}
          </button>
          <button
            onClick={() => setCreateNoteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-washi-100 dark:bg-sumi-100 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)]"
          >
            <Plus className="h-3.5 w-3.5" /> New entry
          </button>
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="border-t border-[var(--border-default)]">
        <div className="flex justify-center gap-16">
          {(["photos", "entries"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors border-t-2 -mt-[2px]",
                tab === t
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              {t === "photos" ? <Grid3X3 className="h-3.5 w-3.5" /> : <AlignLeft className="h-3.5 w-3.5" />}
              {t === "photos" ? "Photos" : "Entries"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Photos tab ─────────────────────────────────────────────────────── */}
      {tab === "photos" && (
        photosLoading ? (
          <div className="grid grid-cols-3 gap-[2px] pt-[2px]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-washi-100 dark:bg-sumi-100" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-washi-100 dark:bg-sumi-100">
              <ImageIcon className="h-7 w-7 text-[var(--text-tertiary)] opacity-60" />
            </div>
            <h3 className="mt-4 font-medium text-[var(--text-primary)]">No photos yet</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Start capturing your trip memories.</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-mid"
            >
              <Upload className="h-4 w-4" /> Add photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px] pt-[2px]">
            {photos.map(photo => (
              <button
                key={photo.id}
                className="aspect-square overflow-hidden focus:outline-none group"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || photo.file_name}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-85"
                  loading="lazy"
                />
              </button>
            ))}
            {/* Upload tile */}
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square border-[2px] border-dashed border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-60"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        )
      )}

      {/* ── Entries tab ────────────────────────────────────────────────────── */}
      {tab === "entries" && (
        notesLoading ? (
          <div className="space-y-3 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-washi-100 dark:bg-sumi-100" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-washi-100 dark:bg-sumi-100">
              <FileText className="h-7 w-7 text-[var(--text-tertiary)] opacity-60" />
            </div>
            <h3 className="mt-4 font-medium text-[var(--text-primary)]">No journal entries yet</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Write down thoughts and memories from your trip.</p>
            <button
              onClick={() => setCreateNoteOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-mid"
            >
              <Plus className="h-4 w-4" /> New entry
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-4">
            {notes.map(note => (
              <div
                key={note.id}
                className="group relative cursor-pointer rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-5 transition-colors hover:border-[var(--border-hover)]"
                onClick={() => setEditNote(note)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    {new Date(note.updated_at).toLocaleDateString("en", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1">{note.title}</h3>
                {note.content && (
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 hidden h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-danger)] group-hover:flex"
                  onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightbox && (
        <PhotoLightbox
          key={lightbox.id}
          initialPhoto={lightbox}
          photos={photos}
          tripId={tripId}
          onClose={() => setLightbox(null)}
          onDelete={async (id) => { await deletePhoto(id); }}
        />
      )}

      {createNoteOpen && <CreateNoteDialog tripId={tripId} onClose={() => setCreateNoteOpen(false)} />}
      <NoteEditorDialog tripId={tripId} note={editNote} onClose={() => setEditNote(null)} />

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
    </div>
  );
}
