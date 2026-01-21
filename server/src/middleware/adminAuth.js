import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from './errorHandler.js';

// Role hierarchy - higher index = more permissions
const ROLE_HIERARCHY = ['user', 'moder', 'administrator', 'admin'];

// Permission definitions for each role
const ROLE_PERMISSIONS = {
  admin: [
    'view_stats',
    'view_users',
    'ban_user',
    'unban_user',
    'delete_user',
    'assign_role',
    'view_profiles',
    'edit_profile',
    'delete_profile',
    'view_messages',
    'delete_message',
    'view_audit_logs'
  ],
  administrator: [
    'view_stats',
    'view_users',
    'ban_user',
    'unban_user',
    'delete_user',
    'view_profiles',
    'edit_profile',
    'delete_profile',
    'view_messages',
    'delete_message',
    'view_audit_logs'
  ],
  moder: [
    'view_stats',
    'view_profiles',
    'edit_profile',
    'view_messages'
  ]
};

// Admin authentication middleware
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No admin token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      throw new AppError('Invalid admin token', 401);
    }

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!admin) {
      throw new AppError('Admin not found', 401);
    }

    // Check if user has admin role
    const roleIndex = ROLE_HIERARCHY.indexOf(admin.role);
    if (roleIndex < ROLE_HIERARCHY.indexOf('moder')) {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }

    req.admin = admin;
    req.adminPermissions = ROLE_PERMISSIONS[admin.role] || [];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Admin token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid admin token', code: 'INVALID_TOKEN' });
    }
    next(error);
  }
};

// Require specific role(s)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const adminRoleIndex = ROLE_HIERARCHY.indexOf(req.admin.role);
    const hasRequiredRole = roles.some(role => {
      const requiredIndex = ROLE_HIERARCHY.indexOf(role);
      return adminRoleIndex >= requiredIndex;
    });

    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Require specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!req.adminPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    next();
  };
};

// Check if admin can perform action on target user
export const canActOnUser = async (adminId, targetUserId, action) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });

  if (!admin || !target) return false;

  // Admin cannot be deleted by anyone (including themselves)
  if (target.role === 'admin' && action === 'delete') {
    return false;
  }

  // Only admin can change roles
  if (action === 'assign_role' && admin.role !== 'admin') {
    return false;
  }

  // administrator cannot act on admin
  if (admin.role === 'administrator' && target.role === 'admin') {
    return false;
  }

  // Moder cannot act on users
  if (admin.role === 'moder') {
    return false;
  }

  return true;
};

// Create audit log entry
export const createAuditLog = async (adminId, action, targetId = null, details = null) => {
  return prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetId,
      details
    }
  });
};
