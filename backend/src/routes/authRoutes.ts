import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post(
  '/register',
  upload.single('picture'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('cnic').trim().notEmpty().withMessage('CNIC is required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

export default router;
