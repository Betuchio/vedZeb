import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  createContactRequest,
  getMyContactRequests,
  updateContactRequestStatus,
  deleteContactRequest
} from '../controllers/contactController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create contact request
router.post(
  '/',
  [
    body('profileId')
      .notEmpty()
      .withMessage('Profile ID is required')
      .isUUID()
      .withMessage('Invalid profile ID'),
    body('message')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Message must be less than 1000 characters'),
    validate
  ],
  createContactRequest
);

// Get my contact requests (sent and received)
router.get(
  '/',
  [
    query('type')
      .optional()
      .isIn(['all', 'sent', 'received'])
      .withMessage('Invalid type'),
    validate
  ],
  getMyContactRequests
);

// Update contact request status (accept/reject)
router.put(
  '/:id',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['accepted', 'rejected'])
      .withMessage('Status must be accepted or rejected'),
    validate
  ],
  updateContactRequestStatus
);

// Delete contact request
router.delete('/:id', deleteContactRequest);

export default router;
