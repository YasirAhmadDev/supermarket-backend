import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Customer from '../models/Customer.js';

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body;
  if (phone) {
    const existing = await Customer.findOne({ phone });
    if (existing) throw new ApiError(409, 'Customer with this phone already exists');
  }
  const customer = await Customer.create({ name, phone, email });
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
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!customer) throw new ApiError(404, 'Customer not found');
  return res.status(200).json(new ApiResponse(200, customer, 'Customer updated'));
});

export { createCustomer, getCustomers, updateCustomer };