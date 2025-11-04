import { apiClient } from './api';
import { DashboardData, DashboardMetrics, ChartsResponse } from '../types/dashboard_type';

export const dashboardService = {
  getOverview: async () => {
    const response = await apiClient.get<DashboardData>('/v1/dashboard/overview');
    return response.data;
  },

  getMetrics: async () => {
    const response = await apiClient.get<DashboardMetrics>('/v1/dashboard/metrics');
    return response.data;
  },

  getCharts: async (dateRange: string = '7d', chartType: string = 'all') => {
    const response = await apiClient.get<ChartsResponse>(
      `/v1/dashboard/charts?date_range=${dateRange}&chart_type=${chartType}`
    );
    return response.data;
  }
};
