import api from '../utils/api';

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userId: string, data: any, picture?: File) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (picture) formData.append('picture', picture);

    const response = await api.put(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getBalance: async (userId: string) => {
    const response = await api.get(`/users/${userId}/balance`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  },
};

