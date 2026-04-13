import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, unique: true },
  requireLocation: { type: Boolean, default: true },
  orderRadius: { type: Number, default: 5 },
  allowTableChange: { type: Boolean, default: false },
  paymentEnabled: { type: Boolean, default: true },
  numberOfTables: { type: Number, default: 10 },
  cafeLatitude: { type: Number, default: 18.5204,min: -90,
    max: 90 }, 
  cafeLongitude: { type: Number, default: 73.8567 ,min: -180,
    max: 180}
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);