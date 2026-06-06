import { useQuery } from "@tanstack/react-query";

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  unit: string;
}

async function fetchWeather(destination: string): Promise<WeatherData> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
  );
  const geoData = await geoRes.json();
  if (!geoData.results?.length) throw new Error("Location not found");

  const { latitude, longitude, name, country } = geoData.results[0];

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&timezone=auto`
  );
  const weatherData = await weatherRes.json();
  const c = weatherData.current;
  const u = weatherData.current_units;

  return {
    location: `${name}, ${country}`,
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m),
    weatherCode: c.weather_code,
    unit: u.temperature_2m,
  };
}

export function useWeather(destination: string, enabled = true) {
  return useQuery<WeatherData>({
    queryKey: ["weather", destination],
    queryFn: () => fetchWeather(destination),
    staleTime: 1000 * 60 * 30,
    enabled: enabled && !!destination,
    retry: 1,
  });
}
