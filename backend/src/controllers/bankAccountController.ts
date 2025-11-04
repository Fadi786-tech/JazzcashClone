import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import UserBankAccount from '../models/UserBankAccount';
import Bank from '../models/Bank';
import { AuthRequest } from '../middleware/auth';

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const banks = await Bank.find({ isActive: true }).select('name code').sort('name');

    res.status(200).json({
      success: true,
      count: banks.length,
      data: banks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const addBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const { bankId, accountTitle, accountNumber, iban, isDefault } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Check if bank exists
    const bank = await Bank.findById(bankId);
    if (!bank || !bank.isActive) {
      res.status(404).json({
        success: false,
        message: 'Bank not found or inactive',
      });
      return;
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await UserBankAccount.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // If no default exists, make this one default
    const existingDefaults = await UserBankAccount.countDocuments({
      userId,
      isDefault: true,
    });
    const shouldBeDefault = isDefault || existingDefaults === 0;

    const bankAccount = await UserBankAccount.create({
      userId,
      bankId,
      accountTitle,
      accountNumber,
      iban: iban || '',
      isDefault: shouldBeDefault,
      isActive: true,
    });

    const populatedAccount = await UserBankAccount.findById(bankAccount._id)
      .populate('bankId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: populatedAccount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const getUserBankAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (req.user?._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view these bank accounts',
      });
      return;
    }

    const bankAccounts = await UserBankAccount.find({ userId, isActive: true })
      .populate('bankId', 'name code')
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bankAccounts.length,
      data: bankAccounts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const updateBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const accountId = req.params.id;
    const userId = req.user?._id;
    const { accountTitle, accountNumber, iban, isDefault } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Check if account belongs to user
    const bankAccount = await UserBankAccount.findOne({
      _id: accountId,
      userId,
    });

    if (!bankAccount) {
      res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
      return;
    }

    // If setting as default, unset other defaults
    if (isDefault && !bankAccount.isDefault) {
      await UserBankAccount.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Update account
    if (accountTitle) bankAccount.accountTitle = accountTitle;
    if (accountNumber) bankAccount.accountNumber = accountNumber;
    if (iban !== undefined) bankAccount.iban = iban;
    if (isDefault !== undefined) bankAccount.isDefault = isDefault;

    await bankAccount.save();

    const updatedAccount = await UserBankAccount.findById(bankAccount._id)
      .populate('bankId', 'name code');

    res.status(200).json({
      success: true,
      message: 'Bank account updated successfully',
      data: updatedAccount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const deleteBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accountId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Check if account belongs to user
    const bankAccount = await UserBankAccount.findOne({
      _id: accountId,
      userId,
    });

    if (!bankAccount) {
      res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
      return;
    }

    // Soft delete
    bankAccount.isActive = false;
    await bankAccount.save();

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
