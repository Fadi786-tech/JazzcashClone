import api from '../utils/api';

export interface AutopaymentData {
  amount: number;
  type: 'bill' | 'transfer' | 'prepaid' | 'postpaid' | 'package';
  schedule: 'daily' | 'weekly' | 'monthly';
  billId?: string;
  receiverId?: string;
  mobileNumber?: string;
  operator?: 'Jazz' | 'Zong' | 'Telenor' | 'Ufone';
  packageName?: string;
}

export const autopaymentService = {
  createAutopayment: async (data: AutopaymentData) => {
    const response = await api.post('/autopayments/create', data);
    return response.data;
  },

  getUserAutopayments: async (userId: string) => {
    const response = await api.get(`/autopayments/${userId}`);
    return response.data;
  },
};

