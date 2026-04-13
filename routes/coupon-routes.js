import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
} from "../controllers/coupon-controller.js";
import { protect } from "../middlewares/auth-middleware.js";
const router = express.Router();
router.get("/", protect, getAllCoupons);
router.post("/", protect, createCoupon);
router.delete("/:id", protect, deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
