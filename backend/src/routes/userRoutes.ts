import express from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  getBalance,
  getAllUsers,
  getCurrentUser,
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/all', getAllUsers);

// Get current user profile with balance and bank accounts
router.get('/me', protect, getCurrentUser);

router.put(
  '/:id',
  protect,
  upload.single('picture'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  ],
  updateProfile as express.RequestHandler
);

router.get('/:id/balance', protect, getBalance);

export default router;
