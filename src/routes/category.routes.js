import express from 'express';
const router = express.Router();
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

router.use(verifyJWT);
router.get('/', getCategories);
router.post('/', authorizeRoles('admin'), createCategory);
router.put('/:id', authorizeRoles('admin'), updateCategory);
router.delete('/:id', authorizeRoles('admin'), deleteCategory);

export default router;