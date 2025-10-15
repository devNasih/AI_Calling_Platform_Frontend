// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// OAuth2 Login Body (exact schema match)
export interface Body_login_v1_login_post {
  grant_type: string | null; // Should match "password"
  username: string;
  password: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
}

// Token Response (exact schema match)
export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Contact Types (matching backend Contact schema)
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: 'active' | 'inactive' | 'dnc';
  createdAt: string;
  updatedAt: string;
  // Backend schema fields
  tag?: string | null;
  region?: string | null;
  phone_number?: string; // For API compatibility
}

// Backend Contact schema (exact match)
export interface ContactSchema {
  id: number | null;
  name: string;
  phone_number: string;
  tag: string | null;
  region: string | null;
}

// API Response type that matches the backend
export interface ContactApiResponse {
  name: string;
  phone_number: string;
}

// Create Contact API types - matches POST /v1/contacts/
export interface ContactCreateRequest {
  id?: number;
  name: string;
  phone_number: string;
  tag: string;
  region: 'global' | string;
}

export interface ContactCreateResponse {
  id: number;
  name: string;
  phone_number: string;
  tag: string;
  region: string;
}

export interface ContactUpload {
  file: File;
  contacts: Contact[];
}

// Upload Body Types (exact schema matches)
export interface Body_upload_contacts_v1_contacts_upload_post {
  file: string; // binary format
}

export interface Body_upload_knowledge_doc_v1_knowledge_upload_post {
  file: string; // binary format
}

export interface ContactUploadApiResponse {
  message: string;
}

// Campaign Types (matching backend schema)
export type CampaignStatus = 'scheduled' | 'running' | 'paused' | 'stopped' | 'completed';

export interface Campaign {
  id: number;
  name: string;
  message: string;
  region: string;
  status: CampaignStatus;
  created_at: string;
}

export interface CampaignCreate {
  name: string;
  message: string;
  region: string;
  status: CampaignStatus;
  created_at?: string;
}

// API Types that match the backend
export interface CampaignStartRequest {
  campaign_name: string;
  message: string;
  region: 'global' | string;
  contact_list: ContactApiResponse[];
}

export interface CampaignScheduleRequest {
  name: string;
  message: string;
  region: string;
  start_time: string;
}

export interface CampaignApiResponse {
  message: string;
}

// Campaign DB Types (matching the swagger schema exactly)
export interface CampaignDB {
  id: number;
  name: string;
  message: string;
  region: string;
  status: CampaignStatus;
  created_at: string;
}

export interface CampaignDBCreate {
  id?: number;
  name: string;
  message: string;
  region: string;
  status?: CampaignStatus; // Optional - backend will set default
  created_at?: string; // Optional - backend will set this
}

export type CampaignAction = 'pause' | 'resume' | 'stop';

// Call Types (matching backend schemas)
export type CallStatus = 'initiated' | 'completed' | 'failed';

export interface Call {
  id: string;
  campaignId: string;
  contactId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';
  duration?: number;
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
  transcriptId?: string;
  aiSummaryId?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

// CallLog schema (exact match)
export interface CallLog {
  id: number | null;
  contact_name: string;
  contact_number: string;
  campaign_name: string;
  region: string;
  provider: string;
  status: CallStatus;
  recording_url: string | null;
  duration: number | null;
  ai_summary: string | null;
  timestamp: string; // date-time format
}

// New Call API Types for inbound and AI processing
export interface InboundCallResponse {
  message: string;
  twiml?: string;
}

export interface ProcessAIRequest {
  call_id: number;
  audio_url: string;
}

export interface ProcessAIResponse {
  message: string;
  transcript?: string;
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  processing_id?: string;
}

// Call History API Types (matches backend response)
export interface CallHistoryRecord {
  id: number;
  contact_name: string;
  contact_number: string;
  campaign_name: string;
  region: string;
  provider: string;
  status: CallStatus;
  recording_url: string;
  duration: number;
  ai_summary: string;
  timestamp: string;
}

export interface CallHistoryFilters {
  campaign_name?: string;
  status?: CallStatus;
  region?: 'global' | 'india' | string;
  limit?: number;
}

// AI Analysis Types
export interface Transcript {
  id: string;
  callId: string;
  content: string;
  confidence: number;
  createdAt: string;
}

export interface AISummary {
  id: string;
  callId: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
  actionItems: string[];
  confidence: number;
  createdAt: string;
}

// Knowledge Base Types
export interface KnowledgeDocument {
  id: string;
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv';
  fileSize: number;
  status: 'uploaded' | 'processing' | 'vectorized' | 'failed';
  vectorized: boolean;
  uploadedAt: string;
  processedAt?: string;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalSize: number;
  processingDocuments: number;
  vectorizedDocuments: number;
  failedDocuments: number;
  uploadedDocuments: number;
}

export interface KnowledgeSearch {
  query: string;
  results: KnowledgeSearchResult[];
}

export interface KnowledgeSearchResult {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

// Analytics Types
export interface AnalyticsData {
  totalCampaigns: number;
  totalCalls: number;
  successRate: number;
  averageCallDuration: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  callsByStatus: {
    completed: number;
    failed: number;
    pending: number;
  };
  campaignPerformance: CampaignPerformance[];
  dailyStats: DailyStats[];
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  totalCalls: number;
  successfulCalls: number;
  successRate: number;
  averageDuration: number;
}

export interface DailyStats {
  date: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'campaign_update' | 'call_update' | 'notification';
  data: any;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Error Types (matching backend schemas)
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface SuccessResponse {
  message: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'file' | 'date' | 'datetime-local';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
}
