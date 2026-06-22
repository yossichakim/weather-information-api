import { apiRequest } from "./client";
import type { WeatherResponse } from "../types/api";

export function getCurrentWeather(city: string): Promise<WeatherResponse> {
  const query = new URLSearchParams({ city });
  return apiRequest(`/weather/current?${query.toString()}`);
}
