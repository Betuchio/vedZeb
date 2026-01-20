import { Router } from 'express';
import { body, query } from 'express-validator';
import multer from 'multer';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadPhoto,
  deletePhoto,
  setPrimaryPhoto,
  getMyProfiles
} from '../controllers/profileController.js';

const router = Router();

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Get all profiles (public with filters)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['searching_sibling', 'searching_child', 'searching_parent', 'searching_relative']),
    query('gender').optional().isIn(['male', 'female', 'unknown']),
    query('birthYearFrom').optional().isInt({ min: 1900, max: 2100 }),
    query('birthYearTo').optional().isInt({ min: 1900, max: 2100 }),
    query('birthMonth').optional().isInt({ min: 1, max: 12 }),
    query('birthDay').optional().isInt({ min: 1, max: 31 }),
    query('maternityHospital').optional().isString(),
    validate
  ],
  optionalAuth,
  getProfiles
);

// Get my profiles (authenticated)
router.get('/my', authenticate, getMyProfiles);

// Get single profile
router.get('/:id', optionalAuth, getProfile);

// Create profile (authenticated)
router.post(
  '/',
  authenticate,
  [
    body('type')
      .notEmpty()
      .withMessage('Profile type is required')
      .isIn(['searching_sibling', 'searching_child', 'searching_parent', 'searching_relative'])
      .withMessage('Invalid profile type'),
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('First name must be between 2 and 100 characters'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'unknown'])
      .withMessage('Invalid gender'),
    body('birthYear')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('Invalid birth year'),
    body('birthMonth')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Invalid birth month'),
    body('birthDay')
      .optional()
      .isInt({ min: 1, max: 31 })
      .withMessage('Invalid birth day'),
    body('maternityHospital')
      .optional()
      .isString(),
    body('myBirthYear')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('Invalid birth year'),
    body('myBirthMonth')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Invalid birth month'),
    body('myBirthDay')
      .optional()
      .isInt({ min: 1, max: 31 })
      .withMessage('Invalid birth day'),
    validate
  ],
  createProfile
);

// Update profile (authenticated, owner only)
router.put(
  '/:id',
  authenticate,
  [
    body('type')
      .optional()
      .isIn(['searching_sibling', 'searching_child', 'searching_parent', 'searching_relative']),
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 100 }),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'unknown']),
    validate
  ],
  updateProfile
);

// Delete profile (authenticated, owner only)
router.delete('/:id', authenticate, deleteProfile);

// Upload photo (authenticated, owner only)
router.post(
  '/:id/photos',
  authenticate,
  upload.single('photo'),
  uploadPhoto
);

// Delete photo (authenticated, owner only)
router.delete('/:id/photos/:photoId', authenticate, deletePhoto);

// Set primary photo (authenticated, owner only)
router.put('/:id/photos/:photoId/primary', authenticate, setPrimaryPhoto);

export default router;
