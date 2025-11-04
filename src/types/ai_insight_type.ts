export interface AiInsightsData {
  insights: Array<{
    call_id: number;
    contact_name: string;
    phone_number: string;
    campaign_id: number | null;
    duration: {
      seconds: number;
      formatted: string;
    };
    sentiment: "Positive" | "Neutral" | "Negative";
    sentiment_score: number | null;
    recording_url: string | null;
    transcription: {
      full_transcript: string;
      summary: string;
    };
    ai_feedback: string;
    conversation_metrics: {
      ai_response_count: number;
      human_detected: boolean;
      conversation_state: string;
    };
    timestamps: {
      initiated_at: string; // ISO date string
      answered_at: string | null; // ISO date string or null
      ended_at: string | null; // ISO date string or null
      insight_generated_at: string; // ISO date string
    };
    call_status: "completed" | "failed" | "initiated";
  }>;
  period: {
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    days: number;
  };
  summary: {
    total_insights: number;
    sentiment_distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
    average_duration: number;
    human_detection_rate: number; // percentage 0-100
  };
};
export type AiInsightsContextType = {
  insightsData: AiInsightsData | null;
  loading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
};
