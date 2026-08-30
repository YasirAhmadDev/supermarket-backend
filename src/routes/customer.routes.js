import express from 'express';
const router = express.Router();
import { createCustomer, getCustomers, updateCustomer } from '../controllers/customer.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

router.use(verifyJWT);
router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;