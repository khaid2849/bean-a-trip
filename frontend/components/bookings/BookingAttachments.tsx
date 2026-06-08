"use client";

import { useRef } from "react";
import { Paperclip, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingFiles, useUploadBookingFile, useDeleteBookingFile } from "@/hooks/usePhotos";
import { mediaUrl } from "@/lib/media";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface BookingAttachmentsProps {
  tripId: string;
  bookingId: string;
}

export function BookingAttachments({ tripId, bookingId }: BookingAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: files = [] } = useBookingFiles(tripId, bookingId);
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadBookingFile(tripId, bookingId);
  const { mutateAsync: deleteFile } = useDeleteBookingFile(tripId, bookingId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  }

  return (
    <div className="mt-3 border-t border-[var(--border-default)] pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <Paperclip className="h-3.5 w-3.5" />
        Attachments ({files.length})
      </p>

      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="mb-2 flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-kincha-mid dark:border-[#4A2E08] bg-kincha-lt/20 dark:bg-[#4A2E08]/30 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:bg-kincha-lt/40 dark:hover:bg-[#4A2E08]/50 disabled:opacity-60"
      >
        <Upload className="h-4 w-4 text-kincha" />
        {isUploading ? "Uploading…" : "Click to attach a file"}
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-washi-100 dark:bg-sumi-100 px-2 py-1">
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                <span className="truncate text-xs text-[var(--text-secondary)]">{file.file_name}</span>
                <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{formatSize(file.file_size)}</span>
              </div>
              <div className="ml-2 flex shrink-0 gap-1">
                <a href={mediaUrl(file.url)} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                    <Download className="h-3 w-3" />
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[var(--text-tertiary)] hover:text-[var(--text-danger)]"
                  onClick={() => deleteFile(file.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
