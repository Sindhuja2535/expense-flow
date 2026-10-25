import api from './api';

export const refreshAnalytics = async () => {
  const response = await api.post('/analytics/refresh');
  return response.data;
};

export const getAnalyticsResults = async () => {
  const response = await api.get('/analytics/results');
  return response.data;
};
