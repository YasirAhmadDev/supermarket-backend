import express from 'express';
const router = express.Router();
import { createBill, getBills, getBillById } from '../controllers/bill.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

router.use(verifyJWT);
router.post('/', createBill);
router.get('/', getBills);
router.get('/:id', getBillById);

export default router;