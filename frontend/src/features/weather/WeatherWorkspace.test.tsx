import { delay, http, HttpResponse } from "msw";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { server } from "../../test/setup";
import { testWeather } from "../../test/fixtures";
import { WeatherWorkspace } from "./WeatherWorkspace";

describe("weather workspace", () => {
  it("shows a loading state while current weather is requested", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/weather/current", async () => {
        await delay(100);
        return HttpResponse.json({ status: "success", data: testWeather });
      }),
    );

    render(<WeatherWorkspace />);
    await user.type(screen.getByLabelText("Search by city"), " London ");
    await user.click(screen.getByRole("button", { name: "Search weather" }));

    expect(screen.getByText("Reading conditions for London…")).toBeInTheDocument();
    expect(await screen.findByText("broken clouds")).toBeInTheDocument();
  });

  it("presents the documented successful weather values", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/weather/current", ({ request }) => {
        expect(new URL(request.url).searchParams.get("city")).toBe("London");
        return HttpResponse.json({ status: "success", data: testWeather });
      }),
    );

    render(<WeatherWorkspace />);
    await user.type(screen.getByLabelText("Search by city"), "London");
    await user.click(screen.getByRole("button", { name: "Search weather" }));

    expect(await screen.findByText("London, England · GB")).toBeInTheDocument();
    expect(screen.getByText("Clouds")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("4.1 m/s")).toBeInTheDocument();
  });

  it("distinguishes a city-not-found response and offers retry", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/weather/current", () =>
        HttpResponse.json(
          { status: "error", message: "City not found" },
          { status: 404 },
        ),
      ),
    );

    render(<WeatherWorkspace />);
    await user.type(screen.getByLabelText("Search by city"), "Atlantis");
    await user.click(screen.getByRole("button", { name: "Search weather" }));

    expect(await screen.findByText("City not found.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry Atlantis" })).toBeInTheDocument();
  });
});
