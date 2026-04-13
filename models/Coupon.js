import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  code: { type: String, required: true, uppercase: true ,index: true},
  discountValue: { type: Number, required: true },
  usageLimit: { type: Number, default: 5 },
  usedCount: { type: Number, default: 0 },
  isDaily: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export default mongoose.model("Coupon", couponSchema);
