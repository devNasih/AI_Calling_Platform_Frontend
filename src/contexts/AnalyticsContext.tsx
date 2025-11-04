import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  AnalyticsSummary,
  AnalyticsData,
  ExportFormat,
} from "../types/analytics_type";
import { AnalyticsService } from "../services/analytics_services";

interface AnalyticsContextType {
  summary: AnalyticsSummary | null;
  data: AnalyticsData | null;
  loading: boolean;
  exporting: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  exportData: (
    format: ExportFormat,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  filterAnalytics: (startDate: string, endDate: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

interface AnalyticsProviderProps {
  children: ReactNode;
  shouldFetch?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const location = useLocation();

  /** Fetch analytics summary + data */
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryResponse, dataResponse] = await Promise.all([
        AnalyticsService.getAnalyticsSummary(),
        AnalyticsService.getAnalyticsData(),
      ]);

      setSummary(summaryResponse);
      setData(dataResponse);
      hasFetchedRef.current = true; // ✅ prevent future auto-fetches
    } catch (err) {
      console.error("❌ Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  /** Export analytics data */
  const exportData = async (
    format: ExportFormat,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setExporting(true);
      await AnalyticsService.downloadAnalyticsExport(format, startDate, endDate);
    } catch (err: any) {
      console.error("❌ Export failed:", err);
      setError(err.message || "Failed to export analytics data");
    } finally {
      setExporting(false);
    }
  };

  /** Filter analytics by date range */
  const filterAnalytics = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);

      const filteredData = await AnalyticsService.filterAnalytics(
        startDate,
        endDate
      );

      // Update data + summary if applicable
      setData((prev) => ({
        ...prev,
        ...filteredData,
      }));

      if (filteredData.metrics) {
        setSummary((prev) => ({
          ...prev,
          ...filteredData.metrics,
        }));
      }
    } catch (err) {
      console.error("❌ Failed to filter analytics:", err);
      setError("Failed to load filtered analytics data");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Fetch only once when visiting /analytics */
  useEffect(() => {
    if (location.pathname === "/analytics" && !hasFetchedRef.current) {
      fetchAnalytics();
    }
  }, [location.pathname]);

  return (
    <AnalyticsContext.Provider
      value={{
        summary,
        data,
        loading,
        exporting,
        error,
        refresh: fetchAnalytics,
        exportData,
        filterAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

/** Custom Hook */
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
