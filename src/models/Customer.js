import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, default: 'Walk-in Customer' },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, sparse: true },
  loyaltyPoints: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);