import { getCurrentWeatherByCity } from "../services/weather.service.js";

export async function getCurrentWeather(req, res, next) {
  const city = req.query.city?.trim();

  if (!city) {
    return res.status(400).json({
      status: "fail",
      message: "The city query parameter is required",
    });
  }

  try {
    const weather = await getCurrentWeatherByCity(city);

    return res.status(200).json({
      status: "success",
      data: weather,
    });
  } catch (error) {
    return next(error);
  }
}