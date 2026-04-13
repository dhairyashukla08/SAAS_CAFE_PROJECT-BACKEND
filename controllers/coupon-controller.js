import Coupon from "../models/Coupon.js";
import { redisClient } from "../index.js";

const clearCouponCache = async (tenantId) => {
  if (redisClient.isOpen) {
  const keys = await redisClient.keys(`coupons:${tenantId}:*`);
    if (keys.length > 0) await redisClient.del(keys);
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).lean();
    return res.json(coupons);
  } catch (err) {
   return  res.status(500).json({ message: err.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const newCoupon = new Coupon({ ...req.body, tenantId });
    await newCoupon.save();
    await clearCouponCache(tenantId);
   if (req.io) {
      req.io.to(`cafe_${tenantId}`).emit("new_coupon_alert", {
        code: newCoupon.code,
        discount: newCoupon.discountValue,
        message: "Early birds only! Redemptions are limited."
      });
    }
    return res.status(201).json(newCoupon);
  } catch (err) {
   return res.status(400).json({ message: "Coupon code already exists" });
  }
};

export const validateCoupon = async (req, res) => {
 const { code, tenantId } = req.body;
  if (!code || !tenantId) return res.status(400).json({ message: "Code and Cafe ID are required" });
  const upperCode = code.toUpperCase();
 const cacheKey = `coupons:${tenantId}:val:${upperCode}`;
  try {

   if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const couponData = JSON.parse(cached);
        if (couponData.usedCount >= couponData.usageLimit) {
           return res.status(403).json({ 
             message: "Early birds already grabbed this! All redemptions are exhausted." 
           });
        }
        return res.json({ discountValue: couponData.discountValue });
      }
    }
    const coupon = await Coupon.findOne({ code: upperCode, tenantId }).lean();

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(403).json({
        message: "Early birds already validated this reward! Check back tomorrow for a new brew.",
      });
    }
    if (redisClient.isOpen) {
      await redisClient.set(cacheKey, JSON.stringify(coupon), { EX: 300 });
    }

   return res.json({ discountValue: coupon.discountValue });
  } catch (err) {
   return res.status(500).json({ message: "Server error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { tenantId } = req.user;
   const deleted = await Coupon.findOneAndDelete({ _id: req.params.id, tenantId });
   if (!deleted) return res.status(404).json({ message: "Coupon not found" });
    await clearCouponCache(tenantId);
    return res.json({ message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting coupon" });
  }
};
