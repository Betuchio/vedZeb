import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import contactRoutes from './routes/contacts.js';
import alertRoutes from './routes/alerts.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Trust proxy for Vercel/cloud deployments (required for rate limiting)
app.set('trust proxy', 1);

// Export prisma for use in other files
export { prisma };

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || origin.includes('vercel.app'))) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (use memory store for serverless)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// SMS rate limiting
const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Too many SMS requests, please try again later.' }
});
app.use('/api/auth/send-code', smsLimiter);

// Verification code rate limiting
const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'VEDZEB API Server',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Error handler
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
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
}

export default app;
