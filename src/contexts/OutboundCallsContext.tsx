import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom"; // ✅ for pathname
import { getOutboundCalls } from "../services/outbound_calls_services";
import {
  OutboundCallType,
  OutboundCallsContextType,
} from "../types/outbound_calls_type";

const OutboundCallsContext = createContext<OutboundCallsContextType | undefined>(undefined);

export const OutboundCallsProvider = ({ children }: { children: ReactNode }) => {
  const [calls, setCalls] = useState<OutboundCallType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const hasFetchedRef = useRef(false); // ✅ track if fetch already happened

  const fetchCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOutboundCalls();
      setCalls(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch outbound calls:", err);
      setError(err.message || "Failed to load outbound calls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/outbound" && !hasFetchedRef.current) {
      fetchCalls();
      hasFetchedRef.current = true; // ✅ prevent future fetches
    }
  }, [location.pathname]);

  return (
    <OutboundCallsContext.Provider
      value={{
        calls,
        loading,
        error,
        refreshCalls: fetchCalls,
      }}
    >
      {children}
    </OutboundCallsContext.Provider>
  );
};

// ✅ Custom hook
export const useOutboundCalls = (): OutboundCallsContextType => {
  const context = useContext(OutboundCallsContext);
  if (!context) {
    throw new Error("useOutboundCalls must be used within an OutboundCallsProvider");
  }
  return context;
};
