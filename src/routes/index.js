import express from 'express';
const router = express.Router();
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import billRoutes from './bill.routes.js';
import reportRoutes from './report.routes.js';

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/bills', billRoutes);
router.use('/reports', reportRoutes);

export default router;