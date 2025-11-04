import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBankAccount extends Document {
  userId: mongoose.Types.ObjectId;
  bankId: mongoose.Types.ObjectId;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserBankAccountSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    bankId: {
      type: Schema.Types.ObjectId,
      ref: 'Bank',
      required: [true, 'Bank ID is required'],
    },
    accountTitle: {
      type: String,
      required: [true, 'Account title is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    iban: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default account per user
UserBankAccountSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.model<IUserBankAccount>('UserBankAccount', UserBankAccountSchema);
