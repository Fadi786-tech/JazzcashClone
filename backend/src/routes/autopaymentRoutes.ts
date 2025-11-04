import express from 'express';
import { body } from 'express-validator';
import {
  createAutopayment,
  getUserAutopayments,
} from '../controllers/autopaymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post(
  '/create',
  protect,
  [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('type')
      .isIn(['bill', 'transfer', 'prepaid', 'postpaid', 'package'])
      .withMessage('Type must be bill, transfer, prepaid, postpaid, or package'),
    body('schedule')
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Schedule must be daily, weekly, or monthly'),
    body('billId')
      .optional()
      .isMongoId()
      .withMessage('Invalid bill ID'),
    body('receiverId')
      .optional()
      .isMongoId()
      .withMessage('Invalid receiver ID'),
    body('mobileNumber')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Mobile number is required for load autopayments'),
    body('operator')
      .optional()
      .isIn(['Jazz', 'Zong', 'Telenor', 'Ufone'])
      .withMessage('Operator must be Jazz, Zong, Telenor, or Ufone'),
    body('packageName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Package name is required for package autopayments'),
  ],
  createAutopayment
);

router.get('/:userId', protect, getUserAutopayments);

export default router;
