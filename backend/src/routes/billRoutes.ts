import express from 'express';
import { body } from 'express-validator';
import { payBill, getUserBills } from '../controllers/billController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post(
  '/pay',
  protect,
  [
    body('category')
      .isIn(['Electricity', 'Gas', 'Water', 'Internet', 'Telephone'])
      .withMessage('Invalid bill category'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('consumerNumber')
      .trim()
      .notEmpty()
      .withMessage('Consumer number is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
  ],
  payBill
);

router.get('/:userId', protect, getUserBills);

export default router;
