import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Customer from '../models/Customer.js';

// Normalize Afghan phone numbers to 07XXXXXXXX format
const normalizePhone = (phone) => {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('93')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('7')) digits = digits.slice(1);
  // Must be exactly 8 digits — extra digits are rejected, not shifted
  if (digits.length !== 8) return undefined;
  return `07${digits}`;
};

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body;
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const existing = await Customer.findOne({ phone: normalizedPhone });
    if (existing) throw new ApiError(409, 'Customer with this phone already exists');
  }
  const customer = await Customer.create({ name, phone: normalizedPhone, email });
  return res.status(201).json(new ApiResponse(201, customer, 'Customer created'));
});

const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, customers, 'Customers fetched'));
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const existing = await Customer.findOne({ phone: normalizedPhone, _id: { $ne: req.params.id } });
    if (existing) throw new ApiError(409, 'Customer with this phone already exists');
  }
  const customer = await Customer.findByIdAndUpdate(req.params.id, { ...req.body, phone: normalizedPhone }, {
    new: true,
    runValidators: true
  });
  if (!customer) throw new ApiError(404, 'Customer not found');
  return res.status(200).json(new ApiResponse(200, customer, 'Customer updated'));
});

export { createCustomer, getCustomers, updateCustomer };