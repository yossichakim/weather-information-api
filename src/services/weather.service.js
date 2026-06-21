const GEOCODING_API_URL =
  "https://api.openweathermap.org/geo/1.0/direct";

const CURRENT_WEATHER_API_URL =
  "https://api.openweathermap.org/data/2.5/weather";

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
}

export async function getCurrentWeatherByCity(city) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw createServiceError(
      "OpenWeather API key is not configured",
      500
    );
  }

  const geocodingUrl = new URL(GEOCODING_API_URL);

  geocodingUrl.searchParams.set("q", city);
  geocodingUrl.searchParams.set("limit", "1");
  geocodingUrl.searchParams.set("appid", apiKey);

  const locationResponse = await fetch(geocodingUrl);

  if (!locationResponse.ok) {
    throw createServiceError(
      "Failed to retrieve location data",
      502
    );
  }

  const locations = await locationResponse.json();

  if (locations.length === 0) {
    throw createServiceError("City not found", 404);
  }

  const location = locations[0];

  const weatherUrl = new URL(CURRENT_WEATHER_API_URL);

  weatherUrl.searchParams.set("lat", location.lat);
  weatherUrl.searchParams.set("lon", location.lon);
  weatherUrl.searchParams.set("appid", apiKey);
  weatherUrl.searchParams.set("units", "metric");

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw createServiceError(
      "Failed to retrieve weather data",
      502
    );
  }

  const weatherData = await weatherResponse.json();
  const conditions = weatherData.weather?.[0];

  return {
    city: location.name,
    state: location.state ?? null,
    country: location.country,
    coordinates: {
      latitude: location.lat,
      longitude: location.lon,
    },
    temperature: {
      current: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      minimum: weatherData.main.temp_min,
      maximum: weatherData.main.temp_max,
      unit: "celsius",
    },
    humidity: {
      value: weatherData.main.humidity,
      unit: "percent",
    },
    conditions: {
      main: conditions?.main ?? null,
      description: conditions?.description ?? null,
    },
    wind: {
      speed: weatherData.wind.speed,
      unit: "meters_per_second",
    },
  };
}