import express from 'express';
import { body } from 'express-validator';
import {
  transferToJazzCash,
  transferToBank,
  transferToCNIC,
  transferToOtherWallet,
} from '../controllers/transferController';
import { protect } from '../middleware/auth';

const router = express.Router();

const transferValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('receiverIdentifier')
    .trim()
    .notEmpty()
    .withMessage('Receiver identifier is required'),
];

router.post('/jazzcash', protect, transferValidation, transferToJazzCash);
router.post('/bank', protect, transferValidation, transferToBank);
router.post('/cnic', protect, transferValidation, transferToCNIC);
router.post('/otherwallet', protect, transferValidation, transferToOtherWallet);

export default router;
