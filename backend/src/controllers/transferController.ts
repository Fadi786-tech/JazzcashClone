import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User';
import Transaction, { ReceiverType, TransactionStatus } from '../models/Transaction';
import UserBankAccount from '../models/UserBankAccount';
import Bank from '../models/Bank';
import { AuthRequest } from '../middleware/auth';

const transferMoney = async (
  req: AuthRequest,
  res: Response,
  receiverType: ReceiverType,
  receiverId?: string
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

    const senderId = req.user?._id;
    const { amount, receiverIdentifier, bankAccountId } = req.body;

    if (!senderId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    // Get sender
    const sender = await User.findById(senderId);
    if (!sender) {
      res.status(404).json({
        success: false,
        message: 'Sender not found',
      });
      return;
    }

    // Check balance
    if (sender.balance < amount) {
      res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
      return;
    }

    // Find receiver based on type
    let receiver: any = null;
    let finalReceiverId: string | undefined = receiverId;
    let receiverBankAccount: any = null; // Store receiver's bank account for bank transfers

    if (receiverType === ReceiverType.JazzCash || receiverType === ReceiverType.OtherWallet) {
      receiver = await User.findOne({ phone: receiverIdentifier });
      if (receiver) {
        finalReceiverId = receiver._id.toString();
      }
    } else if (receiverType === ReceiverType.CNIC) {
      receiver = await User.findOne({ cnic: receiverIdentifier });
      if (receiver) {
        finalReceiverId = receiver._id.toString();
      }
    } else if (receiverType === ReceiverType.Bank) {
      // For bank transfers, check if receiverIdentifier is a bank account
      // receiverIdentifier can be: account number, IBAN, or userId
      receiverBankAccount = await UserBankAccount.findOne({
        $or: [
          { accountNumber: receiverIdentifier },
          { iban: receiverIdentifier },
        ],
        isActive: true,
      }).populate('userId');

      if (receiverBankAccount) {
        receiver = receiverBankAccount.userId as any;
        finalReceiverId = (receiverBankAccount.userId as any)._id.toString();
      }
      // If not found, it's an external bank transfer (no user in system)
    }

    if (receiverType !== ReceiverType.Bank && !receiver) {
      res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
      return;
    }

    // For bank transfers, store bank account info if provided
    // bankAccountId can be: UserBankAccount ObjectId, bank code, or bank name
    let bankAccountInfo = null;
    if (receiverType === ReceiverType.Bank && bankAccountId) {
      const bankAccountIdStr = String(bankAccountId).trim();
      
      // Try as ObjectId first
      if (mongoose.Types.ObjectId.isValid(bankAccountIdStr)) {
        bankAccountInfo = await UserBankAccount.findOne({
          _id: bankAccountIdStr,
          userId: senderId,
          isActive: true,
        }).populate('bankId', 'name code');
      }
      
      // If not found and it's not a valid ObjectId, try to find by bank code/name
      if (!bankAccountInfo) {
        // Find bank by code or name
        let bank = await Bank.findOne({
          code: { $regex: new RegExp(`^${bankAccountIdStr}$`, 'i') },
          isActive: true,
        });
        
        // If not found by code, try by name
        if (!bank) {
          const normalizedSearch = bankAccountIdStr.replace(/\s+/g, '').toLowerCase();
          const allBanks = await Bank.find({ isActive: true });
          bank = allBanks.find(b => {
            const normalizedName = b.name.replace(/\s+/g, '').toLowerCase();
            const normalizedCode = b.code.toLowerCase();
            return normalizedName.includes(normalizedSearch) || 
                   normalizedSearch.includes(normalizedName) ||
                   normalizedCode === normalizedSearch;
          }) || null;
        }
        
        // If bank found, find sender's bank account for that bank
        if (bank) {
          bankAccountInfo = await UserBankAccount.findOne({
            userId: senderId,
            bankId: bank._id,
            isActive: true,
          })
            .populate('bankId', 'name code')
            .sort({ isDefault: -1 }); // Prefer default account
        }
      }
      
      // If still not found, return error
      if (!bankAccountInfo) {
        res.status(400).json({
          success: false,
          message: 'Bank account not found. Please provide a valid bank account ID, bank code (e.g., "MEBL"), or bank name (e.g., "Meezan Bank").',
        });
        return;
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      senderId,
      receiverId: finalReceiverId,
      receiverType,
      amount,
      status: TransactionStatus.Pending,
    });

    // Update balances
    sender.balance -= amount;
    await sender.save();

    if (receiver) {
      if (receiverType === ReceiverType.Bank && receiverBankAccount) {
        // For bank transfers, update the receiver's bank account balance
        receiverBankAccount.balance += amount;
        await receiverBankAccount.save();
        
        // Also update receiver's wallet balance
        receiver.balance += amount;
        await receiver.save();
      } else {
        // For other transfer types, update wallet balance
        receiver.balance += amount;
        await receiver.save();
      }
    }

    // Update transaction status
    transaction.status = TransactionStatus.Completed;
    await transaction.save();

    // Include bank account info in response if it's a bank transfer
    const responseData: any = transaction.toObject();
    if (bankAccountInfo) {
      responseData.senderBankAccount = bankAccountInfo;
    }
    
    // Include receiver's bank account info if it's a bank transfer
    if (receiverType === ReceiverType.Bank && receiverBankAccount) {
      // Reload to get updated balance
      const updatedReceiverBankAccount = await UserBankAccount.findById(receiverBankAccount._id)
        .populate('bankId', 'name code');
      responseData.receiverBankAccount = updatedReceiverBankAccount;
    }

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: responseData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const transferToJazzCash = async (req: AuthRequest, res: Response): Promise<void> => {
  await transferMoney(req, res, ReceiverType.JazzCash);
};

export const transferToBank = async (req: AuthRequest, res: Response): Promise<void> => {
  await transferMoney(req, res, ReceiverType.Bank);
};

export const transferToCNIC = async (req: AuthRequest, res: Response): Promise<void> => {
  await transferMoney(req, res, ReceiverType.CNIC);
};

export const transferToOtherWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  await transferMoney(req, res, ReceiverType.OtherWallet);
};
