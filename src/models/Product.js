import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  barcode: { type: String, unique: true, sparse: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  unit: { type: String, default: 'pcs' },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, required: true },
  taxPercent: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});

export default mongoose.model('Product', productSchema);