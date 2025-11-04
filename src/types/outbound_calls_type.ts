export interface OutboundCallType {
  call_id: number;
  campaign_id: number;
  campaign_name: string;
  contact_name: string;
  phone_number: string;
  status: 'initiated' | 'ringing' | 'answered' | 'failed' | 'completed';
  duration: {
    seconds: number | null;
    formatted: string;
  };
  timestamps: {
    initiated_at: string;  // ISO 8601 timestamp
    answered_at: string | null;
    ended_at: string | null;
  };
  ai_metrics: {
    ai_response_count: number;
    human_detected: boolean;
    sentiment_score: number | null;
    conversation_state: 'greeting' | 'in_progress' | 'ended' | string;
  };
  recording_url: string | null;
  retry_count: number;
  call_result: 'success' | 'failed' | 'no_answer' | string;
}

export interface OutboundCallsContextType {
  calls: OutboundCallType[];
  loading: boolean;
  error: string | null;
  refreshCalls: () => Promise<void>;
}