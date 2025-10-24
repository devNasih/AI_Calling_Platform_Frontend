// ==============================
// Analytics Summary Types
// ==============================
export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface AnalyticsSummary {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  sentiment_distribution: SentimentDistribution;
  ai_processed_calls: number;
}

// ==============================
// Analytics Data Types
// ==============================
export interface Period {
  start_date: string; // ISO string
  end_date: string;   // ISO string
  days: number;
}

export interface CampaignStatusBreakdown {
  draft: number;
  scheduled: number;
  running: number;
  paused: number;
  stopped: number;
  completed: number;
  failed: number;
}

export interface Campaigns {
  total_campaigns: number;
  status_breakdown: CampaignStatusBreakdown;
  recent_campaigns: number;
}

export interface CallStatusBreakdown {
  pending: number;
  ringing: number;
  in_progress: number;
  completed: number;
  failed: number;
  busy: number;
  no_answer: number;
  cancelled: number;
}

export interface Calls {
  total_calls: number;
  total_calls_log: number;
  status_breakdown: CallStatusBreakdown;
  success_rate: number;
  answer_rate: number;
  recent_calls: number;
}

export interface DurationMetrics {
  total_duration_seconds: number;
  average_duration_seconds: number;
  completed_calls: number;
}

export interface AiMetrics {
  total_ai_responses: number;
  average_responses_per_call: number;
  human_detection_rate: number;
  human_detected_calls: number;
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  total_analyzed: number;
}

export interface Contacts {
  total_contacts: number;
  active_contacts: number;
  active_percentage: number;
}

export interface AnalyticsData {
  period: Period;
  campaigns: Campaigns;
  calls: Calls;
  duration_metrics: DurationMetrics;
  ai_metrics: AiMetrics;
  sentiment_analysis: SentimentAnalysis;
  contacts: Contacts;
  campaign_performance: Record<string, any>;
}

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface AnalyticsExportResponse {
  status: string;
  format: ExportFormat;
  data: string; // Raw exported data (CSV string or encoded file)
  period: {
    start_date: string;
    end_date: string;
  };
  records_exported: {
    calls: number;
    campaigns: number;
  };
}