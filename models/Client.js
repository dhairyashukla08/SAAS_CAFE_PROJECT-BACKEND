import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  cafeName: { type: String, required: true },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionStatus: { 
    type: String, 
    enum: ["active", "expired", "trial", "suspended"], 
    default: "trial" 
  },
  planType: { type: String, enum: ["trial", "basic", "pro"], default: "trial" },
  expiryDate: { type: Date, required: true },
  maxTables: { type: Number, default: 10 },
  isLocationRequired: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Client", clientSchema);