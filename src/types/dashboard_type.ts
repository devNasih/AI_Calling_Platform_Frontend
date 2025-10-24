export interface DashboardData {
  overview: {
    total_campaigns: number;
    active_campaigns: number;
    total_contacts: number;
    active_contacts: number;
    total_outbound_calls: number;
    successful_outbound_calls: number;
    total_inbound_calls: number;
    answered_inbound_calls: number;
    today_outbound_calls: number;
    today_inbound_calls: number;
    ai_processed_calls: number;
    total_ai_results: number;
  };
  recent_campaigns: any[]; // You can replace `any` with a Campaign interface if known
  recent_outbound_calls: any[]; // Replace with OutboundCall interface if you have structure
  recent_inbound_calls: any[]; // Replace with InboundCall interface if available
  success_rates: {
    outbound_success_rate: number;
    inbound_answer_rate: number;
    ai_processing_rate: number;
  };
  last_updated: string; // ISO 8601 timestamp
}

export interface CallMetrics {
  today: { outbound: number; inbound: number; total: number };
  week: { outbound: number; inbound: number; total: number };
  month: { outbound: number; inbound: number; total: number };
}

export interface SuccessRates {
  outbound_success_rate: number;
  inbound_answer_rate: number;
}

export interface CampaignMetrics {
  total_campaigns: number;
  active_campaigns: number;
  completion_rate: number;
}

export interface AiMetrics {
  ai_processed_calls: number;
  total_ai_results: number;
  ai_processing_rate: number;
}

export interface DashboardMetrics {
  call_metrics: CallMetrics;
  success_rates: SuccessRates;
  campaign_metrics: CampaignMetrics;
  ai_metrics: AiMetrics;
  last_updated: string;
}

export interface ChartPoint {
  timestamp: string;
  count: number;
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

export interface SentimentChartData {
  distribution: SentimentDistribution;
  timeline: { timestamp: string; sentiment: string; count: number }[];
}

export interface CallsChartData {
  outbound: ChartPoint[];
  inbound: ChartPoint[];
  period: { start: string; end: string; range: string };
}

export interface ChartsResponse {
  charts: {
    calls: CallsChartData;
    campaigns: any[];
    contacts: {
      status_breakdown: Record<string, number>;
      recent_contacts: any[];
    };
    sentiment: SentimentChartData;
  };
  metadata: {
    date_range: string;
    chart_type: string;
    generated_at: string;
  };
}
