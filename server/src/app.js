import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import contactRoutes from './routes/contacts.js';
import alertRoutes from './routes/alerts.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// SMS rate limiting (stricter)
const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 SMS requests per minute
  message: { error: 'Too many SMS requests, please try again later.' }
});
app.use('/api/auth/send-code', smsLimiter);

// Verification code rate limiting (prevent brute force)
const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per 15 minutes
  message: { error: 'Too many verification attempts, please try again later.' }
});
app.use('/api/auth/verify-code', verifyCodeLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/contact-requests', contactRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});
