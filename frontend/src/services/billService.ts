import api from '../utils/api';

export interface BillData {
  category: 'Electricity' | 'Gas' | 'Water' | 'Internet' | 'Telephone';
  companyName: string;
  consumerNumber: string;
  amount: number;
}

export const billService = {
  payBill: async (data: BillData) => {
    const response = await api.post('/bills/pay', data);
    return response.data;
  },

  getUserBills: async (userId: string) => {
    const response = await api.get(`/bills/${userId}`);
    return response.data;
  },
};

