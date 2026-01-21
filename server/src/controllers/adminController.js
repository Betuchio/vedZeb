import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { canActOnUser, createAuditLog } from '../middleware/adminAuth.js';

// Admin login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.user.findFirst({
      where: {
        username: username,
        role: { in: ['moder', 'administrator', 'admin'] }
      }
    });

    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!admin.password) {
      throw new AppError('Password not set for this admin account', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate admin token
    const token = jwt.sign(
      { userId: admin.id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await createAuditLog(admin.id, 'admin_login', null, { ip: req.ip });

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current admin info
export const getMe = async (req, res) => {
  res.json({
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      role: req.admin.role
    },
    permissions: req.adminPermissions
  });
};

// Get dashboard statistics
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProfiles,
      activeProfiles,
      totalMessages,
      totalContactRequests,
      pendingContactRequests,
      bannedUsers,
      recentUsers,
      recentProfiles
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.profile.count(),
      prisma.profile.count({ where: { isActive: true } }),
      prisma.message.count(),
      prisma.contactRequest.count(),
      prisma.contactRequest.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({
        where: {
          role: 'user',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.profile.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    // Limited stats for moder role
    if (req.admin.role === 'moder') {
      return res.json({
        totalProfiles,
        activeProfiles,
        totalMessages,
        recentProfiles
      });
    }

    res.json({
      totalUsers,
      totalProfiles,
      activeProfiles,
      totalMessages,
      totalContactRequests,
      pendingContactRequests,
      bannedUsers,
      recentUsers,
      recentProfiles
    });
  } catch (error) {
    next(error);
  }
};

// Get users list
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      role: role || 'user'
    };

    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (banned !== undefined) {
      where.isBanned = banned === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          username: true,
          role: true,
          isBanned: true,
          bannedAt: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: { profiles: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single user details
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        username: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        createdAt: true,
        profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            contactRequests: true,
            profiles: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Ban user
export const banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const canAct = await canActOnUser(req.admin.id, id, 'ban');
    if (!canAct) {
      throw new AppError('Cannot perform this action on this user', 403);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason || null
      },
      select: {
        id: true,
        phone: true,
        isBanned: true,
        bannedAt: true,
        banReason: true
      }
    });

    await createAuditLog(req.admin.id, 'user_banned', id, { reason });

    res.json({ user, message: 'User banned successfully' });
  } catch (error) {
    next(error);
  }
};

// Unban user
export const unbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const canAct = await canActOnUser(req.admin.id, id, 'unban');
    if (!canAct) {
      throw new AppError('Cannot perform this action on this user', 403);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null
      },
      select: {
        id: true,
        phone: true,
        isBanned: true
      }
    });

    await createAuditLog(req.admin.id, 'user_unbanned', id);

    res.json({ user, message: 'User unbanned successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const canAct = await canActOnUser(req.admin.id, id, 'delete');
    if (!canAct) {
      throw new AppError('Cannot delete this user', 403);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    // Admin user can never be deleted
    if (targetUser.role === 'admin') {
      throw new AppError('Admin user cannot be deleted', 403);
    }

    await prisma.user.delete({ where: { id } });

    await createAuditLog(req.admin.id, 'user_deleted', id, {
      phone: targetUser.phone,
      role: targetUser.role
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign role to user
export const assignRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, username, password } = req.body;

    // Only admin can assign roles
    if (req.admin.role !== 'admin') {
      throw new AppError('Only admin can assign roles', 403);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    // Cannot change admin's role
    if (targetUser.role === 'admin') {
      throw new AppError('Cannot change admin role', 403);
    }

    const validRoles = ['user', 'moder', 'administrator'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const updateData = { role };

    // If promoting to admin role, require username and password
    if (role !== 'user') {
      if (username) {
        // Check if username is taken
        const existingUser = await prisma.user.findFirst({
          where: { username, id: { not: id } }
        });
        if (existingUser) {
          throw new AppError('Username already taken', 400);
        }
        updateData.username = username;
      } else if (!targetUser.username) {
        throw new AppError('Username is required for admin roles', 400);
      }

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      } else if (!targetUser.password) {
        throw new AppError('Password is required for admin roles', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        phone: true,
        username: true,
        role: true
      }
    });

    await createAuditLog(req.admin.id, 'role_assigned', id, {
      oldRole: targetUser.role,
      newRole: role
    });

    res.json({ user, message: 'Role assigned successfully' });
  } catch (error) {
    next(error);
  }
};

// Get profiles list
export const getProfiles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, type, active } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { birthPlace: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              isBanned: true
            }
          },
          photos: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }),
      prisma.profile.count({ where })
    ]);

    res.json({
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, ...updateData } = req.body;

    const profile = await prisma.profile.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...updateData
      }
    });

    await createAuditLog(req.admin.id, 'profile_updated', id, updateData);

    res.json({ profile, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete profile
export const deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    await prisma.profile.delete({ where: { id } });

    await createAuditLog(req.admin.id, 'profile_deleted', id, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      type: profile.type
    });

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get messages list
export const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, contactRequestId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (contactRequestId) {
      where.contactRequestId = contactRequestId;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contactRequest: {
            select: {
              id: true,
              fromUserId: true,
              toProfileId: true,
              status: true
            }
          }
        }
      }),
      prisma.message.count({ where })
    ]);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await prisma.message.delete({ where: { id } });

    await createAuditLog(req.admin.id, 'message_deleted', id, {
      content: message.content.substring(0, 100)
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get audit logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, adminId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change own password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await prisma.user.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin.password) {
      throw new AppError('No password set', 400);
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.admin.id },
      data: { password: hashedPassword }
    });

    await createAuditLog(req.admin.id, 'password_changed', req.admin.id);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
