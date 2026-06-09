const CACHE_PREFIX = "geocode:";

export async function geocode(destination: string): Promise<{ lat: number; lng: number } | null> {
  const key = CACHE_PREFIX + destination.toLowerCase().trim();

  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch { /* sessionStorage unavailable */ }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en-US,en" } }
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    try { sessionStorage.setItem(key, JSON.stringify(result)); } catch { /* storage full */ }
    return result;
  } catch {
    return null;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
