import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  sendCode,
  verifyCode,
  refreshToken,
  logout,
  getMe
} from '../controllers/authController.js';

const router = Router();

// Send verification code
router.post(
  '/send-code',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[0-9]{9,15}$/)
      .withMessage('Invalid phone number format'),
    validate
  ],
  sendCode
);

// Verify code and get tokens
router.post(
  '/verify-code',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Code must be 6 digits'),
    validate
  ],
  verifyCode
);

// Refresh access token
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    validate
  ],
  refreshToken
);

// Logout
router.post('/logout', logout);

// Get current user
router.get('/me', authenticate, getMe);

export default router;
