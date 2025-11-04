import mongoose, { Document, Schema } from 'mongoose';

export enum LoadType {
  Prepaid = 'Prepaid',
  Postpaid = 'Postpaid',
  Package = 'Package',
}

export enum Operator {
  Jazz = 'Jazz',
  Zong = 'Zong',
  Telenor = 'Telenor',
  Ufone = 'Ufone',
}

export enum LoadStatus {
  Successful = 'Successful',
  Failed = 'Failed',
}

export interface ILoad extends Document {
  userId: mongoose.Types.ObjectId;
  type: LoadType;
  mobileNumber: string;
  operator: Operator;
  amount: number;
  packageName?: string;
  status: LoadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LoadSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: Object.values(LoadType),
      required: [true, 'Load type is required'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
    },
    operator: {
      type: String,
      enum: Object.values(Operator),
      required: [true, 'Operator is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    packageName: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(LoadStatus),
      default: LoadStatus.Successful,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILoad>('Load', LoadSchema);
