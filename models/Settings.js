import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  requireLocation: { type: Boolean, default: true },
  orderRadius: { type: Number, default: 5 },
  allowTableChange: { type: Boolean, default: false },
  paymentEnabled: { type: Boolean, default: true },
  numberOfTables: { type: Number, default: 10 },
  cafeLatitude: { type: Number, default: 18.5204 }, 
  cafeLongitude: { type: Number, default: 73.8567 }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);