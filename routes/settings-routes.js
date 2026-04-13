import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings-controller.js";
import { protect } from "../middlewares/auth-middleware.js";
const router = express.Router();
router.get("/", protect, getSettings);
router.post("/", protect, updateSettings);
export default router;
