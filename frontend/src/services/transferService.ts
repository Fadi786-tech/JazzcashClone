import api from '../utils/api';

export interface TransferData {
  amount: number;
  receiverIdentifier: string;
  bankAccountId?: string;
}

export const transferService = {
  transferToJazzCash: async (data: TransferData) => {
    const response = await api.post('/transfer/jazzcash', data);
    return response.data;
  },

  transferToBank: async (data: TransferData) => {
    const response = await api.post('/transfer/bank', data);
    return response.data;
  },

  transferToCNIC: async (data: TransferData) => {
    const response = await api.post('/transfer/cnic', data);
    return response.data;
  },

  transferToOtherWallet: async (data: TransferData) => {
    const response = await api.post('/transfer/otherwallet', data);
    return response.data;
  },
};

