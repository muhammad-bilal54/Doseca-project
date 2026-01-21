
//  Auth Routes
// Handles authentication endpoints
 

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const {
  protect,
  authLimiter,
  registerValidator,
  loginValidator,
} = require('../middleware');

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
