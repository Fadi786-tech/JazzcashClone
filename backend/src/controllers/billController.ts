import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Bill, { BillCategory, BillStatus } from '../models/Bill';
import { AuthRequest } from '../middleware/auth';

export const payBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const userId = req.user?._id;
    const { category, companyName, consumerNumber, amount } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check balance
    if (user.balance < amount) {
      res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
      return;
    }

    // Create bill
    const bill = await Bill.create({
      userId,
      category,
      companyName,
      consumerNumber,
      amount,
      status: BillStatus.Pending,
    });

    // Deduct amount from user balance
    user.balance -= amount;
    await user.save();

    // Update bill status
    bill.status = BillStatus.Paid;
    bill.paidAt = new Date();
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill paid successfully',
      data: bill,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getUserBills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (req.user?._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view these bills',
      });
      return;
    }

    const bills = await Bill.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
