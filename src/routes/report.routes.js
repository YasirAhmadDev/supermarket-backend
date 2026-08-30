import express from 'express';
const router = express.Router();
import { getDashboardStats, getSalesReport, getTopProducts } from '../controllers/report.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

router.use(verifyJWT);
router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);
router.get('/top-products', getTopProducts);

export default router;