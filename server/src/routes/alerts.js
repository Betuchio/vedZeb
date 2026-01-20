import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createAlert,
  getMyAlerts,
  updateAlert,
  deleteAlert
} from '../controllers/alertController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create search alert
router.post(
  '/',
  [
    body('filters')
      .notEmpty()
      .withMessage('Filters are required')
      .isObject()
      .withMessage('Filters must be an object'),
    validate
  ],
  createAlert
);

// Get my alerts
router.get('/', getMyAlerts);

// Update alert
router.put(
  '/:id',
  [
    body('filters').optional().isObject(),
    body('isActive').optional().isBoolean(),
    validate
  ],
  updateAlert
);

// Delete alert
router.delete('/:id', deleteAlert);

export default router;
