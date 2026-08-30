import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Category from '../models/Category.js';

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, 'Category name is required');
  const exists = await Category.findOne({ name });
  if (exists) throw new ApiError(409, 'Category already exists');
  const category = await Category.create({ name });
  return res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, categories, 'Categories fetched'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, 'Category not found');
  return res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Category deleted'));
});

export { createCategory, getCategories, updateCategory, deleteCategory };