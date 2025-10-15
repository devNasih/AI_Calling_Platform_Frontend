import { apiClient } from './api';
import { AnalyticsData, Campaign, Call } from '../types';

export const dashboardService = {
  // Get dashboard analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await apiClient.get<AnalyticsData>('/v1/analytics');
    return response.data;
  },

  // Get recent campaigns
  getRecentCampaigns: async (limit: number = 5): Promise<Campaign[]> => {
    const response = await apiClient.get<Campaign[]>(`/v1/campaigns/recent?limit=${limit}`);
    return response.data;
  },

  // Get recent calls
  getRecentCalls: async (limit: number = 10): Promise<Call[]> => {
    const response = await apiClient.get<Call[]>(`/v1/calls/recent?limit=${limit}`);
    return response.data;
  },

  // Get real-time stats
  getRealTimeStats: async () => {
    const response = await apiClient.get('/v1/analytics/realtime');
    return response.data;
  },
};
