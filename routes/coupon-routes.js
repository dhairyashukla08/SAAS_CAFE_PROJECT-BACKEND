import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
} from "../controllers/coupon-controller.js";
const router = express.Router();
router.get("/", getAllCoupons);
router.post("/", createCoupon);
router.post("/validate", validateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
