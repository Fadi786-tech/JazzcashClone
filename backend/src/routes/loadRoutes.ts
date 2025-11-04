import express from 'express';
import { body } from 'express-validator';
import {
  prepaidLoad,
  postpaidLoad,
  packageLoad,
} from '../controllers/loadController';
import { protect } from '../middleware/auth';

const router = express.Router();

const commonLoadValidation = [
  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required'),
  body('operator')
    .isIn(['Jazz', 'Zong', 'Telenor', 'Ufone'])
    .withMessage('Invalid operator'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
];

router.post(
  '/prepaid',
  protect,
  commonLoadValidation,
  prepaidLoad
);

router.post(
  '/postpaid',
  protect,
  commonLoadValidation,
  postpaidLoad
);

router.post(
  '/package',
  protect,
  [
    ...commonLoadValidation,
    body('packageName').trim().notEmpty().withMessage('Package name is required'),
  ],
  packageLoad
);

export default router;
