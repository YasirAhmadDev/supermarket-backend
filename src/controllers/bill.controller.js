import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import generateInvoiceNumber from '../utils/generateInvoiceNumber.js';

// POST /api/v1/bills
const createBill = asyncHandler(async (req, res) => {
  const { items, customerId, discount = 0, paymentMethod = 'cash' } = req.body;

  if (!items || !items.length) {
    throw new ApiError(400, 'Bill must contain at least one item');
  }

  let subTotal = 0;
  let totalTax = 0;
  const billItems = [];
  const productsToUpdate = [];

  // Step 1: Validate everything first (before touching stock)
  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) throw new ApiError(404, `Product not found: ${item.productId}`);
    if (!product.isActive) throw new ApiError(400, `Product is inactive: ${product.name}`);
    if (product.stockQuantity < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
    }

    const lineSubTotal = product.sellingPrice * item.quantity;
    const lineTax = (lineSubTotal * product.taxPercent) / 100;
    const lineTotal = lineSubTotal + lineTax;

    billItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.sellingPrice,
      taxPercent: product.taxPercent,
      total: lineTotal
    });

    subTotal += lineSubTotal;
    totalTax += lineTax;

    productsToUpdate.push({ product, quantity: item.quantity });
  }

  const grandTotal = subTotal + totalTax - discount;

  if (grandTotal < 0) {
    throw new ApiError(400, 'Discount cannot exceed bill total');
  }

  // Step 2: Deduct stock for all products
  for (const { product, quantity } of productsToUpdate) {
    product.stockQuantity -= quantity;
    await product.save();
  }

  // Step 3: Generate invoice number and create the bill
  const invoiceNumber = await generateInvoiceNumber();

  const bill = await Bill.create({
    invoiceNumber,
    customer: customerId || undefined,
    cashier: req.user._id,
    items: billItems,
    subTotal,
    totalTax,
    discount,
    grandTotal,
    paymentMethod
  });

  // Step 4: Update customer's total purchases if provided
  if (customerId) {
    await Customer.findByIdAndUpdate(customerId, { $inc: { totalPurchases: grandTotal } });
  }

  // Step 5: Populate customer details for the response
  const populatedBill = await Bill.findById(bill._id)
    .populate('customer', 'name phone')
    .populate('cashier', 'name');

  return res.status(201).json(new ApiResponse(201, populatedBill, 'Bill created successfully'));
});

// GET /api/v1/bills
const getBills = asyncHandler(async (req, res) => {
  const { from, to, cashierId } = req.query;
  const filter = {};

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (cashierId) filter.cashier = cashierId;

  const bills = await Bill.find(filter)
    .populate('customer', 'name phone')
    .populate('cashier', 'name')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, bills, 'Bills fetched'));
});

// GET /api/v1/bills/:id
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate('customer', 'name phone')
    .populate('cashier', 'name')
    .populate('items.product', 'name barcode');

  if (!bill) throw new ApiError(404, 'Bill not found');
  return res.status(200).json(new ApiResponse(200, bill, 'Bill fetched'));
});

export { createBill, getBills, getBillById };