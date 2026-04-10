import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true ,index: true},
  discountValue: { type: Number, required: true },
  usageLimit: { type: Number, default: 5 },
  usedCount: { type: Number, default: 0 },
  isDaily: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

export default mongoose.model("Coupon", couponSchema);
