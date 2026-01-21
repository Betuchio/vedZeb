import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { adminAuth, requireRole, requirePermission } from '../middleware/adminAuth.js';
import {
  login,
  getMe,
  getStats,
  getUsers,
  getUser,
  banUser,
  unbanUser,
  deleteUser,
  assignRole,
  getProfiles,
  updateProfile,
  deleteProfile,
  getMessages,
  deleteMessage,
  getAuditLogs,
  changePassword
} from '../controllers/adminController.js';

const router = Router();

// Public route - Admin login
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

// Protected routes - require admin authentication
router.use(adminAuth);

// Get current admin info
router.get('/me', getMe);

// Change own password
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    validate
  ],
  changePassword
);

// Dashboard statistics
router.get('/stats', requirePermission('view_stats'), getStats);

// Users management
router.get('/users', requirePermission('view_users'), getUsers);
router.get('/users/:id', requirePermission('view_users'), getUser);
router.put('/users/:id/ban', requirePermission('ban_user'), banUser);
router.put('/users/:id/unban', requirePermission('unban_user'), unbanUser);
router.delete('/users/:id', requirePermission('delete_user'), deleteUser);
router.put(
  '/users/:id/role',
  requirePermission('assign_role'),
  [
    body('role').isIn(['user', 'moder', 'administrator']).withMessage('Invalid role'),
    validate
  ],
  assignRole
);

// Profiles management
router.get('/profiles', requirePermission('view_profiles'), getProfiles);
router.put('/profiles/:id', requirePermission('edit_profile'), updateProfile);
router.delete('/profiles/:id', requirePermission('delete_profile'), deleteProfile);

// Messages management
router.get('/messages', requirePermission('view_messages'), getMessages);
router.delete('/messages/:id', requirePermission('delete_message'), deleteMessage);

// Audit logs
router.get('/audit-logs', requirePermission('view_audit_logs'), getAuditLogs);

export default router;
