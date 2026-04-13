import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
  tableNumber: { type: String, required: true },
  items: [
    {
    //   itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
    itemId: { type: String, required: true },
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Served", "Completed"],
    default: "Pending",
    index: true,
  },
  couponUsed: { type: String, default: null },
 createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.model("Order", orderSchema);
