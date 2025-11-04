import api from '../utils/api';

export interface BankAccountData {
  bankId: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  isDefault?: boolean;
}

export const bankAccountService = {
  getBanks: async () => {
    const response = await api.get('/bank/banks');
    return response.data;
  },

  addBankAccount: async (data: BankAccountData) => {
    const response = await api.post('/bank/accounts', data);
    return response.data;
  },

  getUserBankAccounts: async (userId: string) => {
    const response = await api.get(`/bank/accounts/${userId}`);
    return response.data;
  },

  updateBankAccount: async (accountId: string, data: Partial<BankAccountData>) => {
    const response = await api.put(`/bank/accounts/${accountId}`, data);
    return response.data;
  },

  deleteBankAccount: async (accountId: string) => {
    const response = await api.delete(`/bank/accounts/${accountId}`);
    return response.data;
  },
};

