import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User';
import UserBankAccount from '../models/UserBankAccount';
import Bank from '../models/Bank';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { name, email, password, phone, cnic, bankAccounts: bankAccountsStr } = req.body;
    const picture = req.file ? req.file.path : '';

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }, { cnic }] });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email, phone, or CNIC',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      cnic,
      picture,
      balance: 1000,
    });

    // Parse and create bank accounts if provided
    if (bankAccountsStr) {
      try {
        let bankAccounts;
        
        // Parse bankAccounts if it's a string
        if (typeof bankAccountsStr === 'string') {
          const trimmed = bankAccountsStr.trim();
          if (trimmed === '') {
            // Empty string means no bank accounts
            bankAccounts = [];
          } else {
            try {
              bankAccounts = JSON.parse(trimmed);
            } catch (parseError) {
              console.error('Error parsing bankAccounts JSON:', parseError);
              res.status(400).json({
                success: false,
                message: 'Invalid bankAccounts format. Must be a valid JSON array.',
                error: parseError instanceof Error ? parseError.message : 'JSON parse error',
              });
              return;
            }
          }
        } else {
          bankAccounts = bankAccountsStr;
        }
        
        // Validate it's an array
        if (!Array.isArray(bankAccounts)) {
          res.status(400).json({
            success: false,
            message: 'bankAccounts must be an array',
          });
          return;
        }
        
        // Validate and create bank accounts
        if (bankAccounts.length > 0) {
          for (let i = 0; i < bankAccounts.length; i++) {
            const account = bankAccounts[i];
            
            // Validate required fields
            if (!account.bankId || !account.accountTitle || !account.accountNumber) {
              res.status(400).json({
                success: false,
                message: `Bank account ${i + 1} is missing required fields (bankId, accountTitle, or accountNumber)`,
              });
              return;
            }
            
            // Find bank - accept ObjectId, bank code, or bank name
            let bank = null;
            const bankIdStr = String(account.bankId).trim();
            
            // Try as ObjectId first
            if (mongoose.Types.ObjectId.isValid(bankIdStr)) {
              bank = await Bank.findById(bankIdStr);
            }
            
            // If not found, try by code (case-insensitive)
            if (!bank) {
              bank = await Bank.findOne({ 
                code: { $regex: new RegExp(`^${bankIdStr}$`, 'i') },
                isActive: true 
              });
            }
            
            // If still not found, try by name (case-insensitive, handle variations)
            if (!bank) {
              // Normalize the search string: remove spaces, make lowercase for better matching
              const normalizedSearch = bankIdStr.replace(/\s+/g, '').toLowerCase();
              
              // Get all active banks and find one that matches
              const allBanks = await Bank.find({ isActive: true });
              bank = allBanks.find(b => {
                const normalizedName = b.name.replace(/\s+/g, '').toLowerCase();
                const normalizedCode = b.code.toLowerCase();
                return normalizedName.includes(normalizedSearch) || 
                       normalizedSearch.includes(normalizedName) ||
                       normalizedCode === normalizedSearch;
              }) || null;
            }
            
            // Validate bank exists and is active
            if (!bank || !bank.isActive) {
              res.status(400).json({
                success: false,
                message: `Bank account ${i + 1}: Bank not found or inactive. Please provide a valid bank ID, code (e.g., "MEBL"), or name (e.g., "Meezan Bank").`,
              });
              return;
            }
            
            // Create bank account
            try {
              const bankAccount = await UserBankAccount.create({
                userId: user._id,
                bankId: bank._id, // Use the actual bank ObjectId
                accountTitle: account.accountTitle.trim(),
                accountNumber: account.accountNumber.trim(),
                iban: account.iban ? account.iban.trim() : '',
                isDefault: i === 0, // First account is default
                isActive: true,
              });
            } catch (createError: any) {
              console.error('Error creating bank account:', createError);
              res.status(400).json({
                success: false,
                message: `Error creating bank account ${i + 1}: ${createError.message || 'Unknown error'}`,
              });
              return;
            }
          }
        }
      } catch (error: any) {
        console.error('Error processing bank accounts:', error);
        res.status(500).json({
          success: false,
          message: `Error processing bank accounts: ${error.message || 'Unknown error'}`,
        });
        return;
      }
    }

    if (user) {
      // Populate bank accounts for response
      const populatedBankAccounts = await UserBankAccount.find({ userId: user._id })
        .populate('bankId', 'name code');

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cnic: user.cnic,
          picture: user.picture,
          balance: user.balance,
          bankAccounts: populatedBankAccounts,
          token: generateToken(user._id.toString()),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
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

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Get user bank accounts
    const bankAccounts = await UserBankAccount.find({ userId: user._id, isActive: true })
      .populate('bankId', 'name code')
      .sort({ isDefault: -1 });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cnic: user.cnic,
        picture: user.picture,
        balance: user.balance,
        bankAccounts: bankAccounts,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
