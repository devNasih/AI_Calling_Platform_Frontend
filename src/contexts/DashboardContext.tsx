import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  DashboardData,
  DashboardMetrics,
  ChartsResponse,
} from "../types/dashboard_type";
import { dashboardService } from "../services/dashboard_services";

interface DashboardContextType {
  overview: DashboardData | null;
  metrics: DashboardMetrics | null;
  charts: ChartsResponse | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [overview, setOverview] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<ChartsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const location = useLocation();

  /** Fetch all dashboard data */
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, metricsData, chartsData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getMetrics(),
        dashboardService.getCharts("7d", "all"),
      ]);

      setOverview(overviewData);
      setMetrics(metricsData);
      setCharts(chartsData);
      hasFetchedRef.current = true; // ✅ Mark as fetched
    } catch (err: any) {
      console.error("❌ DashboardContext error:", err);
      setError(err?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Fetch only once when visiting /dashboard */
  useEffect(() => {
    if (location.pathname === "/dashboard" && !hasFetchedRef.current) {
      fetchAll();
    }
  }, [location.pathname]);

  return (
    <DashboardContext.Provider
      value={{
        overview,
        metrics,
        charts,
        loading,
        error,
        refreshDashboard: fetchAll,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

/** Custom Hook */
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
