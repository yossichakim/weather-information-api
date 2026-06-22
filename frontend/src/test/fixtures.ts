import type { Task, User, Weather } from "../types/api";

export const testUser: User = {
  id: 1,
  email: "pilot@example.com",
  createdAt: "2026-06-22T12:00:00.000Z",
};

export const testWeather: Weather = {
  city: "London",
  state: "England",
  country: "GB",
  coordinates: { latitude: 51.5074, longitude: -0.1278 },
  temperature: {
    current: 18.4,
    feelsLike: 18.1,
    minimum: 17.2,
    maximum: 19.3,
    unit: "celsius",
  },
  humidity: { value: 72, unit: "percent" },
  conditions: { main: "Clouds", description: "broken clouds" },
  wind: { speed: 4.1, unit: "meters_per_second" },
};

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 7,
    title: "Check weather for London",
    description: "Review current conditions before departure",
    city: "London",
    category: "travel",
    status: "PENDING",
    createdAt: "2026-06-22T12:30:00.000Z",
    updatedAt: "2026-06-22T12:30:00.000Z",
    ...overrides,
  };
}
