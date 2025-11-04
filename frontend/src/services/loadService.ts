import api from '../utils/api';

export interface LoadData {
  mobileNumber: string;
  operator: 'Jazz' | 'Zong' | 'Telenor' | 'Ufone';
  amount: number;
  packageName?: string;
}

export const loadService = {
  prepaidLoad: async (data: LoadData) => {
    const response = await api.post('/load/prepaid', data);
    return response.data;
  },

  postpaidLoad: async (data: LoadData) => {
    const response = await api.post('/load/postpaid', data);
    return response.data;
  },

  packageLoad: async (data: LoadData) => {
    const response = await api.post('/load/package', data);
    return response.data;
  },
};

