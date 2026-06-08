import axios from "axios";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Use the same hostname the browser is currently using, just on the API port
    return `${window.location.protocol}//${window.location.hostname}:8001/api/v1`;
  }
  // SSR fallback (not used for data fetching in this app)
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001") + "/api/v1";
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
});
