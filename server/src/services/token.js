import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma.js';

export const generateAccessToken = (userId) => {
  // Ensure expiresIn is a valid value (default to 15 minutes)
  const expiresIn = process.env.JWT_EXPIRES_IN && process.env.JWT_EXPIRES_IN.trim()
    ? process.env.JWT_EXPIRES_IN.trim()
    : '15m';

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

export const generateRefreshToken = async (userId) => {
  const token = uuidv4();
  const expiresAt = new Date();
  const refreshExpiryDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);
  expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });

  return token;
};

export const verifyRefreshToken = async (token) => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!refreshToken) {
    return null;
  }

  if (refreshToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
    return null;
  }

  return refreshToken;
};

export const revokeRefreshToken = async (token) => {
  try {
    await prisma.refreshToken.delete({ where: { token } });
    return true;
  } catch {
    return false;
  }
};

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

export const cleanupExpiredTokens = async () => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  return result.count;
};
