import mongoose from "mongoose";
const cafeSchema=new mongoose.Schema({
    name: { type: String, required: true },
  ownerEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Active", "Suspended"], 
    default: "Active" 
  },
  plan: { 
    type: String, 
    enum: ["Free", "Monthly", "Yearly"], 
    default: "Monthly" 
  },
  subscriptionExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Cafe", cafeSchema);