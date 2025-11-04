import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import { startAutopaymentCron } from './cron/autopaymentCron';
import { initializeBanks } from './utils/initializeBanks';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import transferRoutes from './routes/transferRoutes';
import billRoutes from './routes/billRoutes';
import loadRoutes from './routes/loadRoutes';
import autopaymentRoutes from './routes/autopaymentRoutes';
import bankAccountRoutes from './routes/bankAccountRoutes';

// Load environment variables
dotenv.config();

// Connect to database (banks will be initialized automatically)
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
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
    message: 'Server is running',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start cron job
startAutopaymentCron();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
