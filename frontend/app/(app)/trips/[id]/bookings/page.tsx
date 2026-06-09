"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBookings, useCreateBooking, useUpdateBooking, useDeleteBooking } from "@/hooks/useBookings";
import { useTrip } from "@/hooks/useTrips";
import { formatAmount } from "@/lib/trip-utils";
import { BookingAttachments } from "@/components/bookings/BookingAttachments";
import { useSettings } from "@/context/SettingsContext";
import { getIcon } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import type { Booking, BookingCreate, BookingStatus } from "@/types/booking";

const STATUS_COLOR: Record<BookingStatus, string> = {
  confirmed: "bg-matcha-lt dark:bg-[#1E3A1A] text-matcha-dk dark:text-matcha-lt",
  pending:   "bg-kincha-lt dark:bg-[#4A2E08] text-kincha-dk dark:text-kincha-lt",
  cancelled: "bg-terracotta-lt dark:bg-[#5A2318] text-terracotta-dk dark:text-terracotta-lt",
};
const BOOKING_STATUSES: BookingStatus[] = ["confirmed", "pending", "cancelled"];

function BookingForm({ defaultValues, onSubmit, isLoading, submitLabel = "Add booking" }: {
  defaultValues?: Partial<Booking>;
  onSubmit: (d: BookingCreate) => void;
  isLoading?: boolean;
  submitLabel?: string;
}) {
  const { settings } = useSettings();
  const bookingTypes = settings.bookingTypes;

  const [type,         setType]         = useState(defaultValues?.type ?? bookingTypes[0]?.id ?? "flight");
  const [title,        setTitle]        = useState(defaultValues?.title ?? "");
  const [confirmation, setConfirmation] = useState(defaultValues?.confirmation_number ?? "");
  const [provider,     setProvider]     = useState(defaultValues?.provider ?? "");
  const [checkIn,      setCheckIn]      = useState(defaultValues?.check_in ?? "");
  const [checkOut,     setCheckOut]     = useState(defaultValues?.check_out ?? "");
  const [amount,       setAmount]       = useState(defaultValues?.amount?.toString() ?? "");
  const [notes,        setNotes]        = useState(defaultValues?.notes ?? "");
  const [status,       setStatus]       = useState<BookingStatus>(defaultValues?.status ?? "confirmed");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      type, title,
      confirmation_number: confirmation || undefined,
      provider:    provider    || undefined,
      check_in:    checkIn     || undefined,
      check_out:   checkOut    || undefined,
      amount:      amount      ? parseFloat(amount) : undefined,
      notes:       notes       || undefined,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {bookingTypes.map(t => {
            const Icon = getIcon(t.icon);
            const active = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
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
        <Label>Title</Label>
        <Input placeholder="e.g. JAL Flight to Tokyo" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Confirmation #</Label><Input placeholder="ABC123" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Provider</Label><Input placeholder="e.g. Booking.com" value={provider} onChange={e => setProvider(e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Check-in / Departure</Label><Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Check-out / Arrival</Label><Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Amount</Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <div className="flex gap-1.5">
            {BOOKING_STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-lg border px-2 py-1 text-xs font-medium capitalize transition-colors",
                  status === s
                    ? "border-kincha bg-kincha text-white"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-kincha-mid hover:text-kincha"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-1.5"><Label>Notes</Label><Input placeholder="Any notes…" value={notes} onChange={e => setNotes(e.target.value)} /></div>

      <Button type="submit" className="w-full bg-kincha hover:bg-kincha-mid text-white font-medium" disabled={isLoading}>
        {isLoading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function EditBookingDialog({ tripId, booking, onClose }: { tripId: string; booking: Booking | null; onClose: () => void }) {
  const { mutateAsync, isPending } = useUpdateBooking(tripId, booking?.id ?? "");
  if (!booking) return null;
  return (
    <Dialog open={!!booking} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Edit booking</DialogTitle></DialogHeader>
        <BookingForm defaultValues={booking} onSubmit={async d => { await mutateAsync(d); onClose(); }} isLoading={isPending} submitLabel="Save changes" />
      </DialogContent>
    </Dialog>
  );
}

export default function BookingsPage({ params }: { params: { id: string } }) {
  const { id: tripId } = params;
  const { data: trip } = useTrip(tripId);
  const { data: bookings = [], isLoading } = useBookings(tripId);
  const currency = trip?.currency ?? "VND";
  const { mutateAsync: createBooking, isPending: isCreating } = useCreateBooking(tripId);
  const { mutateAsync: deleteBooking } = useDeleteBooking(tripId);
  const { settings } = useSettings();
  const bookingTypes = settings.bookingTypes;

  const [addOpen,      setAddOpen]      = useState(false);
  const [editBooking,  setEditBooking]  = useState<Booking | null>(null);

  // Group by type, preserving settings order
  const grouped = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    (acc[b.type] = acc[b.type] ?? []).push(b);
    return acc;
  }, {});

  // All type ids that have at least one booking (settings order + unknown types at end)
  const typeOrder = [
    ...bookingTypes.map(t => t.id).filter(id => grouped[id]?.length),
    ...Object.keys(grouped).filter(id => !bookingTypes.find(t => t.id === id) && grouped[id]?.length),
  ];

  function getTypeName(typeId: string) {
    return bookingTypes.find(t => t.id === typeId)?.name ?? typeId;
  }
  function getTypeIcon(typeId: string) {
    const cfg = bookingTypes.find(t => t.id === typeId);
    return getIcon(cfg?.icon ?? "Package");
  }
  function getTypeColor(typeId: string) {
    return bookingTypes.find(t => t.id === typeId)?.color ?? "#9E8E7A";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${tripId}`}><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">Bookings</h2>
            <p className="text-sm text-[var(--text-tertiary)]">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          className="inline-flex self-end items-center gap-2 rounded-lg bg-kincha px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-kincha-mid sm:self-auto"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add booking
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-washi-100 dark:bg-sumi-100" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-hover)] py-20 text-center">
          <Bookmark className="h-8 w-8 text-[var(--text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">No bookings yet. Add your flights, hotels, and more.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-kincha px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-kincha-mid" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add booking
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {typeOrder.map(typeId => {
            const Icon = getTypeIcon(typeId);
            return (
              <div key={typeId}>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  <Icon className="h-4 w-4" style={{ color: getTypeColor(typeId) }} /> {getTypeName(typeId)}
                </h3>
                <div className="space-y-2">
                  {grouped[typeId].map(booking => {
                    const BIcon = getTypeIcon(booking.type);
                    return (
                      <div key={booking.id} className="rounded-xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-4 transition-colors hover:border-kincha-mid">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-0.5 inline-flex shrink-0 rounded-lg p-2"
                              style={{ backgroundColor: `${getTypeColor(booking.type)}18`, color: getTypeColor(booking.type) }}
                            >
                              <BIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-[var(--text-primary)]">{booking.title}</p>
                                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_COLOR[booking.status])}>
                                  {booking.status}
                                </span>
                              </div>
                              {booking.provider && <p className="text-sm text-[var(--text-secondary)]">{booking.provider}</p>}
                              {booking.confirmation_number && <p className="text-sm text-[var(--text-secondary)]">#{booking.confirmation_number}</p>}
                              {(booking.check_in || booking.check_out) && (
                                <p className="mt-1 text-sm font-medium" style={{ color: getTypeColor(booking.type) }}>
                                  {booking.check_in && new Date(booking.check_in).toLocaleDateString("en", { month: "short", day: "numeric" })}
                                  {booking.check_in && booking.check_out ? " → " : ""}
                                  {booking.check_out && new Date(booking.check_out).toLocaleDateString("en", { month: "short", day: "numeric" })}
                                </p>
                              )}
                              {booking.notes && <p className="mt-1 text-sm text-[var(--text-tertiary)]">{booking.notes}</p>}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {booking.amount && <span className="text-sm font-medium text-[var(--text-primary)]">{formatAmount(booking.amount, currency)}</span>}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" onClick={() => setEditBooking(booking)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--text-tertiary)] hover:text-[var(--text-danger)]" onClick={() => deleteBooking(booking.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <BookingAttachments tripId={tripId} bookingId={booking.id} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add booking</DialogTitle></DialogHeader>
          <BookingForm onSubmit={async d => { await createBooking(d); setAddOpen(false); }} isLoading={isCreating} />
        </DialogContent>
      </Dialog>
      <EditBookingDialog tripId={tripId} booking={editBooking} onClose={() => setEditBooking(null)} />
    </div>
  );
}
