import mongoose from "mongoose";

const TableSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  tableNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

TableSchema.index({ tenantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model('Table', TableSchema);