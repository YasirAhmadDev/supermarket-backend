import express from 'express';
const router = express.Router();
import {
  createProduct,
  getProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

router.use(verifyJWT);
router.get('/', getProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProductById);
router.post('/', authorizeRoles('admin'), createProduct);
router.put('/:id', authorizeRoles('admin'), updateProduct);
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

export default router;