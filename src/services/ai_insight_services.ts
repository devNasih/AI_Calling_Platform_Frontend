// services/aiInsightsService.ts
import { apiClient } from "./api";
import { AiInsightsData } from "../types/ai_insight_type";

/**
 * Fetch recent AI insights
 * @returns Promise<AiInsightsData>
 */
export async function getRecentAiInsights(): Promise<AiInsightsData> {
  try {
    const response = await apiClient.get<AiInsightsData>(
      "/v1/ai/insights/recent"
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recent AI insights:", error);
    throw error;
  }
}
