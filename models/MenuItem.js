import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "tea",
        "sandwiches",
        "coffee",
        "ice tea",
        "mocktails",
        "shakes",
        "breads",
        "burger",
        "pav and fries",
        "pasta",
        "pizza",
        "momos",
        "maggi",
        "rolls",
        "desert",
        "cafe special",
      ],
    },
    variants: [
      {
        size: { type: String, default: "Regular" },
        price: { type: Number, required: true },
      },
    ],
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true },
);

menuItemSchema.index({ category: 1 });
menuItemSchema.index({ name: 'text' });

export default mongoose.model("MenuItem", menuItemSchema);
