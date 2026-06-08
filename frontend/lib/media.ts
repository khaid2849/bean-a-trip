/**
 * Converts a MinIO presigned URL to a proxied relative URL.
 * The proxy fetches the URL server-side (where the MinIO host is always
 * reachable), so the same relative path works from both LAN and Tailscale.
 */
export function mediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return `/api/media?url=${encodeURIComponent(url)}`;
}
