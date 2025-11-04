import mongoose, { Document, Schema } from 'mongoose';

export enum BillCategory {
  Electricity = 'Electricity',
  Gas = 'Gas',
  Water = 'Water',
  Internet = 'Internet',
  Telephone = 'Telephone',
}

export enum BillStatus {
  Paid = 'Paid',
  Pending = 'Pending',
}

export interface IBill extends Document {
  userId: mongoose.Types.ObjectId;
  category: BillCategory;
  companyName: string;
  consumerNumber: string;
  amount: number;
  status: BillStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    category: {
      type: String,
      enum: Object.values(BillCategory),
      required: [true, 'Bill category is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
    },
    consumerNumber: {
      type: String,
      required: [true, 'Consumer number is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    status: {
      type: String,
      enum: Object.values(BillStatus),
      default: BillStatus.Pending,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBill>('Bill', BillSchema);
