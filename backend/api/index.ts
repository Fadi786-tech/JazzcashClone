import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../src/config/db';
import { errorHandler, notFound } from '../src/middleware/errorHandler';

// Import routes
import authRoutes from '../src/routes/authRoutes';
import userRoutes from '../src/routes/userRoutes';
import transferRoutes from '../src/routes/transferRoutes';
import billRoutes from '../src/routes/billRoutes';
import loadRoutes from '../src/routes/loadRoutes';
import autopaymentRoutes from '../src/routes/autopaymentRoutes';
import bankAccountRoutes from '../src/routes/bankAccountRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/load', loadRoutes);
app.use('/api/autopayments', autopaymentRoutes);
app.use('/api/bank', bankAccountRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running on Vercel',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
});

// Simple test route that doesn't require database
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JazzCash Clone API is running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      transfer: '/api/transfer',
      bills: '/api/bills',
      load: '/api/load',
      autopayments: '/api/autopayments',
      bank: '/api/bank'
    }
  });
});

// Manual autopayment trigger (for testing)
app.get('/api/trigger-autopayments', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Import the autopayment function
    const { runAutopayment } = await import('../src/cron/autopaymentCron');
    await runAutopayment();

    res.status(200).json({
      success: true,
      message: 'Autopayments triggered manually',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual autopayment trigger error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger autopayments'
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database connection (but don't wait for it to avoid blocking)
connectDB().catch(console.error);

// Export the Express API
export default app;