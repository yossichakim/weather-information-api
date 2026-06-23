import { apiRequest } from "./client";
import type { WeatherResponse } from "../types/api";

/**
 * Requests public current-weather data while URLSearchParams safely encodes
 * the user-supplied city value.
 */
export function getCurrentWeather(city: string): Promise<WeatherResponse> {
  const query = new URLSearchParams({ city });
  return apiRequest(`/weather/current?${query.toString()}`);
}
