export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  picture?: string;
  balance: number;
  bankAccounts?: BankAccount[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccount {
  _id: string;
  userId: string;
  bankId: {
    _id: string;
    name: string;
    code: string;
  };
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Bank {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Transaction {
  _id: string;
  senderId: string;
  receiverId?: string;
  receiverType: 'JazzCash' | 'Bank' | 'CNIC' | 'OtherWallet';
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  _id: string;
  userId: string;
  category: 'Electricity' | 'Gas' | 'Water' | 'Internet' | 'Telephone';
  companyName: string;
  consumerNumber: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Autopayment {
  _id: string;
  userId: string;
  amount: number;
  type: 'bill' | 'transfer' | 'prepaid' | 'postpaid' | 'package';
  schedule: 'daily' | 'weekly' | 'monthly';
  billId?: string;
  receiverId?: string;
  mobileNumber?: string;
  operator?: string;
  packageName?: string;
  isActive: boolean;
  lastExecuted?: string;
  nextExecution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormData {
  [key: string]: any;
}

