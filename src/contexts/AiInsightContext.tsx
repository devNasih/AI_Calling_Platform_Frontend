import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { getRecentAiInsights } from "../services/ai_insight_services";
import {
  AiInsightsData,
  AiInsightsContextType,
} from "../types/ai_insight_type";

const AiInsightsContext = createContext<AiInsightsContextType | undefined>(
  undefined
);

type AiInsightsProviderProps = { children: ReactNode };

export const AiInsightsProvider = ({ children }: AiInsightsProviderProps) => {
  const [insightsData, setInsightsData] = useState<AiInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const hasFetchedRef = useRef(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentAiInsights();
      setInsightsData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch AI insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/ai") {
      if (!hasFetchedRef.current) {
        fetchInsights();
        hasFetchedRef.current = true;
      }
    } else {
      hasFetchedRef.current = false;
    }
  }, [location.pathname, fetchInsights]);

  return (
    <AiInsightsContext.Provider
      value={{ insightsData, loading, error, refreshInsights: fetchInsights }}
    >
      {children}
    </AiInsightsContext.Provider>
  );
};

export const useAiInsights = (): AiInsightsContextType => {
  const context = useContext(AiInsightsContext);
  if (!context) {
    throw new Error("useAiInsights must be used within an AiInsightsProvider");
  }
  return context;
};
