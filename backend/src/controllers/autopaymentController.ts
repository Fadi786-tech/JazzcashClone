import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Autopayment, { AutopaymentType, ScheduleType } from '../models/Autopayment';
import Bill from '../models/Bill';
import Transaction, { ReceiverType } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export const createAutopayment = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const { 
      amount, 
      type, 
      schedule, 
      billId, 
      receiverId, 
      receiverType,
      mobileNumber,
      operator,
      packageName
    } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Validate load-related fields for load types
    if (type === AutopaymentType.Prepaid || type === AutopaymentType.Postpaid || type === AutopaymentType.Package) {
      if (!mobileNumber || !operator) {
        res.status(400).json({
          success: false,
          message: 'Mobile number and operator are required for load autopayments',
        });
        return;
      }
      if (type === AutopaymentType.Package && !packageName) {
        res.status(400).json({
          success: false,
          message: 'Package name is required for package autopayments',
        });
        return;
      }
    }

    // Calculate next run date
    let nextRun = new Date();
    if (schedule === ScheduleType.Daily) {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (schedule === ScheduleType.Weekly) {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (schedule === ScheduleType.Monthly) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    const autopayment = await Autopayment.create({
      userId,
      amount,
      type,
      schedule,
      nextRun,
      isActive: true,
      billId: type === AutopaymentType.Bill ? billId : undefined,
      receiverId: type === AutopaymentType.Transfer ? receiverId : undefined,
      receiverType: type === AutopaymentType.Transfer ? receiverType : undefined,
      mobileNumber: (type === AutopaymentType.Prepaid || type === AutopaymentType.Postpaid || type === AutopaymentType.Package) ? mobileNumber : undefined,
      operator: (type === AutopaymentType.Prepaid || type === AutopaymentType.Postpaid || type === AutopaymentType.Package) ? operator : undefined,
      packageName: type === AutopaymentType.Package ? packageName : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Autopayment created successfully',
      data: autopayment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getUserAutopayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (req.user?._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view these autopayments',
      });
      return;
    }

    const autopayments = await Autopayment.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: autopayments.length,
      data: autopayments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
