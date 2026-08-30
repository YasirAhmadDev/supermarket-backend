import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Product from '../models/Product.js';

const createProduct = asyncHandler(async (req, res) => {
  const { name, barcode, category, unit, purchasePrice, sellingPrice, taxPercent, stockQuantity, lowStockThreshold } = req.body;
  if (!name || sellingPrice === undefined) {
    throw new ApiError(400, 'Name and selling price are required');
  }
  if (barcode) {
    const existing = await Product.findOne({ barcode });
    if (existing) throw new ApiError(409, 'Product with this barcode already exists');
  }
  const product = await Product.create({
    name, barcode, category, unit, purchasePrice, sellingPrice, taxPercent, stockQuantity, lowStockThreshold
  });
  return res.status(201).json(new ApiResponse(201, product, 'Product created'));
});

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock } = req.query;
  const filter = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  let products = await Product.find(filter).populate('category', 'name').sort({ name: 1 });
  if (lowStock === 'true') {
    products = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
  }
  return res.status(200).json(new ApiResponse(200, products, 'Products fetched'));
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) throw new ApiError(404, 'Product not found');
  return res.status(200).json(new ApiResponse(200, product, 'Product fetched'));
});

const getProductByBarcode = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ barcode: req.params.barcode, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found for this barcode');
  return res.status(200).json(new ApiResponse(200, product, 'Product fetched'));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, 'Product not found');
  return res.status(200).json(new ApiResponse(200, product, 'Product updated'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  // Soft delete — keeps historical bill references valid
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Product deleted'));
});

export {
  createProduct,
  getProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deleteProduct
};