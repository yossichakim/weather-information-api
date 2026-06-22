import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getTasks);
router.post("/", authenticate, createTask);

router.get("/:id", authenticate, getTaskById);
router.patch("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;