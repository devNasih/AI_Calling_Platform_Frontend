import { apiClient } from "./api";
import { OutboundCallType } from "../types/outbound_calls_type";

export const getOutboundCalls = async (): Promise<OutboundCallType[]> => {
  try {
    const response = await apiClient.get("/v1/outbound");

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.outbound_calls || [];

    return data as OutboundCallType[];
  } catch (error: any) {
    console.error("Error fetching outbound calls:", error);
    throw error;
  }
};
