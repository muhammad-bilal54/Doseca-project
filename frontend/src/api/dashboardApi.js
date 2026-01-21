

import api from './axios';

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get upcoming scheduled posts
  getUpcoming: async () => {
    const response = await api.get('/dashboard/upcoming');
    return response.data;
  },
};
