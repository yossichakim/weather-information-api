import { useState, type FormEvent } from "react";
import { getCurrentWeather } from "../../api/weather";
import { normalizeApiError, type ApiError } from "../../api/errors";
import { Button } from "../../components/Button";
import { InlineAlert, Spinner } from "../../components/Feedback";
import type { Weather } from "../../types/api";

function weatherTone(condition: string | null): string {
  const value = condition?.toLowerCase() || "";
  if (value.includes("clear")) return "clear";
  if (value.includes("rain") || value.includes("drizzle")) return "rain";
  if (value.includes("snow")) return "snow";
  if (value.includes("thunder")) return "storm";
  if (value.includes("cloud")) return "cloud";
  return "neutral";
}

function temperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function WeatherWorkspace() {
  const [city, setCity] = useState("");
  const [lastCity, setLastCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (requestedCity: string) => {
    const trimmed = requestedCity.trim();
    if (!trimmed) {
      setError(normalizeApiError(new Error("Enter a city to search.")));
      return;
    }
    setLoading(true);
    setError(null);
    setLastCity(trimmed);
    try {
      const response = await getCurrentWeather(trimmed);
      setWeather(response.data);
    } catch (caught) {
      setWeather(null);
      setError(normalizeApiError(caught));
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void search(city);
  };

  const tone = weatherTone(weather?.conditions.main || null);

  return (
    <section className={`weather-panel weather-panel--${tone}`} aria-labelledby="weather-title">
      <div className="weather-panel__ambient" aria-hidden="true" />
      <div className="weather-panel__content">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Live conditions</span>
            <h1 id="weather-title">Read the atmosphere.</h1>
          </div>
          <span className="live-indicator">
            <span aria-hidden="true" />
            Current weather
          </span>
        </div>

        <form className="weather-search" onSubmit={submit}>
          <label htmlFor="weather-city">Search by city</label>
          <div className="weather-search__row">
            <input
              id="weather-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Try London, Tel Aviv, or Tokyo"
              autoComplete="off"
            />
            <Button type="submit" busy={loading}>
              Search weather
            </Button>
          </div>
        </form>

        <div className="weather-state" aria-live="polite">
          {loading ? <Spinner label={`Reading conditions for ${lastCity}…`} /> : null}
          {!loading && error ? (
            <div className="weather-error">
              <InlineAlert tone={error.kind === "not-found" ? "warning" : "danger"}>
                <strong>
                  {error.kind === "not-found"
                    ? "City not found."
                    : error.kind === "provider"
                      ? "Weather provider unavailable."
                      : "Weather request failed."}
                </strong>{" "}
                {error.message}
              </InlineAlert>
              {lastCity ? (
                <Button variant="secondary" onClick={() => void search(lastCity)}>
                  Retry {lastCity}
                </Button>
              ) : null}
            </div>
          ) : null}
          {!loading && !error && !weather ? (
            <div className="weather-initial">
              <span className="weather-orbit" aria-hidden="true" />
              <div>
                <h2>Your weather station is ready.</h2>
                <p>
                  Search a city for current temperature, humidity, wind, and conditions.
                </p>
              </div>
            </div>
          ) : null}
          {!loading && weather ? (
            <article className="weather-result">
              <div className="weather-result__primary">
                <div>
                  <span className="weather-result__location">
                    {weather.city}
                    {weather.state ? `, ${weather.state}` : ""} · {weather.country}
                  </span>
                  <p className="weather-result__condition">
                    {weather.conditions.main || "Current conditions"}
                  </p>
                  <p className="weather-result__description">
                    {weather.conditions.description || "No description reported"}
                  </p>
                </div>
                <strong className="weather-result__temperature">
                  {temperature(weather.temperature.current)}
                  <span>C</span>
                </strong>
              </div>
              <dl className="weather-metrics">
                <div>
                  <dt>Feels like</dt>
                  <dd>{temperature(weather.temperature.feelsLike)}C</dd>
                </div>
                <div>
                  <dt>Low / High</dt>
                  <dd>
                    {temperature(weather.temperature.minimum)} /{" "}
                    {temperature(weather.temperature.maximum)}
                  </dd>
                </div>
                <div>
                  <dt>Humidity</dt>
                  <dd>{weather.humidity.value}%</dd>
                </div>
                <div>
                  <dt>Wind</dt>
                  <dd>{weather.wind.speed} m/s</dd>
                </div>
              </dl>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
