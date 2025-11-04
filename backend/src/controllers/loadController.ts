import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Load, { LoadType, LoadStatus } from '../models/Load';
import { AuthRequest } from '../middleware/auth';

const processLoad = async (
  req: AuthRequest,
  res: Response,
  loadType: LoadType
): Promise<void> => {
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
    const { mobileNumber, operator, amount, packageName } = req.body;

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

    // Create load
    const load = await Load.create({
      userId,
      type: loadType,
      mobileNumber,
      operator,
      amount,
      packageName: loadType === LoadType.Package ? packageName : undefined,
      status: LoadStatus.Successful,
    });

    // Deduct amount from user balance
    user.balance -= amount;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Load processed successfully',
      data: load,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const prepaidLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  await processLoad(req, res, LoadType.Prepaid);
};

export const postpaidLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  await processLoad(req, res, LoadType.Postpaid);
};

export const packageLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  await processLoad(req, res, LoadType.Package);
};
