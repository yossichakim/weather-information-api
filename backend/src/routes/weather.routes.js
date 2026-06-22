import { Router } from "express";

import { getCurrentWeather } from "../controllers/weather.controller.js";

const router = Router();

router.get("/current", getCurrentWeather);

export default router;