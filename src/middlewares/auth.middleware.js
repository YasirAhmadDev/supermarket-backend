import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

// Verifies JWT and attaches user to req.user
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized request: token missing');
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decodedToken._id).select('-password');

  if (!user) {
    throw new ApiError(401, 'Invalid access token: user not found');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Contact admin.');
  }

  req.user = user;
  next();
});

// Restricts route access to specific roles. Usage: authorizeRoles('admin')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized request');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not allowed to access this resource`
      );
    }
    next();
  };
};

export { verifyJWT, authorizeRoles };