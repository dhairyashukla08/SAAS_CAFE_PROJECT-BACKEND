import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
