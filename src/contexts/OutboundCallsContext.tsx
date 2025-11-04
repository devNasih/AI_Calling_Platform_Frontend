import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getOutboundCalls } from "../services/outbound_calls_services";
import {
  OutboundCallType,
  OutboundCallsContextType,
} from "../types/outbound_calls_type";

const OutboundCallsContext = createContext<
  OutboundCallsContextType | undefined
>(undefined);

// ✅ Provider component
export const OutboundCallsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [calls, setCalls] = useState<OutboundCallType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOutboundCalls();
      setCalls(Array.isArray(data) ? data : []); // ✅ always array
    } catch (err: any) {
      console.error("Failed to fetch outbound calls:", err);
      setError(err.message || "Failed to load outbound calls");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchCalls();
  }, []);

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

// ✅ Custom hook to consume the context
export const useOutboundCalls = (): OutboundCallsContextType => {
  const context = useContext(OutboundCallsContext);
  if (!context) {
    throw new Error(
      "useOutboundCalls must be used within an OutboundCallsProvider"
    );
  }
  return context;
};
