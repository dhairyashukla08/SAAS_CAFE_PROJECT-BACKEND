import mongoose from "mongoose";

const TableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Table', TableSchema);