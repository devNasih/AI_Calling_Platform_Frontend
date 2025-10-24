import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  DashboardData,
  DashboardMetrics,
  ChartsResponse
} from '../types/dashboard_type';
import { dashboardService } from '../services/dashboard_services';

interface DashboardContextType {
  overview: DashboardData | null;
  metrics: DashboardMetrics | null;
  charts: ChartsResponse | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  overview: null,
  metrics: null,
  charts: null,
  loading: false,
  error: null,
  refreshDashboard: async () => {}
});

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [overview, setOverview] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<ChartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, metricsData, chartsData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getMetrics(),
        dashboardService.getCharts('7d', 'all')
      ]);

      setOverview(overviewData);
      setMetrics(metricsData);
      setCharts(chartsData);
    } catch (err: any) {
      console.error('DashboardContext error:', err);
      setError(err?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        overview,
        metrics,
        charts,
        loading,
        error,
        refreshDashboard: fetchAll
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
