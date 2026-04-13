import express from "express";
const router = express.Router();
import {
  placeOrder,
  getActiveOrders,
  updateOrderStatus,
  getOrderHistory,
} from "../controllers/order-controller.js";

import { protect } from "../middlewares/auth-middleware.js";

router.post("/", placeOrder);

router.get("/history", protect, getOrderHistory);

router.get("/active", protect, getActiveOrders);

router.put("/:id", protect, updateOrderStatus);

export default router;
