import api from '../utils/api';
//import { FormData } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  cnic: string;
  picture?: File;
  bankAccounts?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phone', data.phone);
    formData.append('cnic', data.cnic);
    if (data.picture) {
      formData.append('picture', data.picture);
    }
    if (data.bankAccounts) {
      formData.append('bankAccounts', data.bankAccounts);
    }

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

