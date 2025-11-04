import mongoose, { Document, Schema } from 'mongoose';

export interface IBank extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

const BankSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
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

export default mongoose.model<IBank>('Bank', BankSchema);

// Pakistani Banks List
export const PAKISTANI_BANKS = [
  { name: 'Allied Bank Limited', code: 'ABL' },
  { name: 'Askari Bank', code: 'AKBL' },
  { name: 'Bank Al Habib', code: 'BAH' },
  { name: 'Bank Alfalah', code: 'BAFL' },
  { name: 'Bank of Khyber', code: 'BOK' },
  { name: 'Bank of Punjab', code: 'BOP' },
  { name: 'Faysal Bank', code: 'FBL' },
  { name: 'Habib Bank Limited', code: 'HBL' },
  { name: 'JS Bank', code: 'JSBL' },
  { name: 'MCB Bank', code: 'MCB' },
  { name: 'Meezan Bank', code: 'MEBL' },
  { name: 'National Bank of Pakistan', code: 'NBP' },
  { name: 'Sindh Bank', code: 'SBL' },
  { name: 'Soneri Bank', code: 'SNBL' },
  { name: 'Standard Chartered Bank', code: 'SCB' },
  { name: 'Summit Bank', code: 'SMBL' },
  { name: 'United Bank Limited', code: 'UBL' },
  { name: 'Albaraka Bank', code: 'ABP' },
  { name: 'Dubai Islamic Bank', code: 'DIB' },
  { name: 'Bank Islami', code: 'BIPL' },
  { name: 'First Women Bank', code: 'FWB' },
  { name: 'Industrial and Commercial Bank of China', code: 'ICBC' },
  { name: 'Samba Bank', code: 'SAMB' },
];
