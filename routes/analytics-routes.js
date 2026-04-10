import express from "express";
import { getBusinessSummary } from "../controllers/analytics-controller.js";
import { protect } from "../middlewares/auth-middleware.js";
const router=express.Router();

router.get("/summary",protect,getBusinessSummary);

export default router;