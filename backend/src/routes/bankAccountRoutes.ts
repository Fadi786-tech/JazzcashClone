import express from 'express';
import { body } from 'express-validator';
import {
  getBanks,
  addBankAccount,
  getUserBankAccounts,
  updateBankAccount,
  deleteBankAccount,
} from '../controllers/bankAccountController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get list of all banks (public)
router.get('/banks', getBanks);

// Bank account management (protected)
router.post(
  '/accounts',
  protect,
  [
    body('bankId').isMongoId().withMessage('Valid bank ID is required'),
    body('accountTitle').trim().notEmpty().withMessage('Account title is required'),
    body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
    body('iban').optional().trim(),
    body('isDefault').optional().isBoolean(),
  ],
  addBankAccount
);

router.get('/accounts/:userId', protect, getUserBankAccounts);

router.put(
  '/accounts/:id',
  protect,
  [
    body('accountTitle').optional().trim().notEmpty().withMessage('Account title cannot be empty'),
    body('accountNumber').optional().trim().notEmpty().withMessage('Account number cannot be empty'),
    body('iban').optional().trim(),
    body('isDefault').optional().isBoolean(),
  ],
  updateBankAccount
);

router.delete('/accounts/:id', protect, deleteBankAccount);

export default router;
