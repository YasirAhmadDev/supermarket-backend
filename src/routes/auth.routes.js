import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser
} from '../controllers/auth.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

router.post('/register', verifyJWT, authorizeRoles('admin'), registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', verifyJWT, logoutUser);
router.get('/me', verifyJWT, getCurrentUser);

export default router;