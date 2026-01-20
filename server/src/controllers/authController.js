import { prisma } from '../app.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateVerificationCode, sendVerificationCode } from '../services/sms.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} from '../services/token.js';

export const sendCode = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Normalize phone number (remove spaces, ensure format)
    const normalizedPhone = phone.replace(/\s+/g, '').trim();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone: normalizedPhone }
      });
    }

    // Invalidate previous codes
    await prisma.verificationCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt
      }
    });

    // Send SMS
    await sendVerificationCode(normalizedPhone, code);

    res.json({
      message: 'Verification code sent',
      // Include code in development for testing
      ...(process.env.SMS_MOCK_MODE === 'true' && { code })
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    const normalizedPhone = phone.replace(/\s+/g, '').trim();

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Find valid verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verificationCode) {
      throw new AppError('Invalid or expired code', 400);
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true }
    });

    // Mark phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        phoneVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token required', 400);
    }

    const tokenData = await verifyRefreshToken(token);

    if (!tokenData) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Revoke old refresh token
    await revokeRefreshToken(token);

    // Generate new tokens
    const accessToken = generateAccessToken(tokenData.userId);
    const newRefreshToken = await generateRefreshToken(tokenData.userId);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await revokeRefreshToken(token);
    }

    // If user is authenticated, revoke all their tokens
    if (req.user) {
      await revokeAllUserTokens(req.user.id);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        phoneVerified: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
