import mongoose, { Document, Schema } from 'mongoose';

export enum AutopaymentType {
  Bill = 'bill',
  Transfer = 'transfer',
  Prepaid = 'prepaid',
  Postpaid = 'postpaid',
  Package = 'package',
}

export enum ScheduleType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export interface IAutopayment extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: AutopaymentType;
  schedule: ScheduleType;
  nextRun: Date;
  isActive: boolean;
  billId?: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  receiverType?: string;
  // Load-related fields
  mobileNumber?: string;
  operator?: string;
  packageName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AutopaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: Object.values(AutopaymentType),
      required: [true, 'Autopayment type is required'],
    },
    schedule: {
      type: String,
      enum: Object.values(ScheduleType),
      required: [true, 'Schedule is required'],
    },
    nextRun: {
      type: Date,
      required: [true, 'Next run date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiverType: {
      type: String,
    },
    // Load-related fields for autopayment
    mobileNumber: {
      type: String,
      trim: true,
    },
    operator: {
      type: String,
      enum: ['Jazz', 'Zong', 'Telenor', 'Ufone'],
    },
    packageName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAutopayment>('Autopayment', AutopaymentSchema);
