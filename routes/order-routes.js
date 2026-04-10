import express from "express";
const router = express.Router();
import {
  placeOrder,
  getActiveOrders,
  updateOrderStatus,
  getOrderHistory,
} from "../controllers/order-controller.js";

router.post("/", placeOrder);

router.get("/history", getOrderHistory);

router.get("/active", getActiveOrders);

router.put("/:id", updateOrderStatus);

export default router;
