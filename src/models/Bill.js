import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  taxPercent: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const billSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [billItemSchema],
  subTotal: { type: Number, required: true },
  totalTax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'other'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);