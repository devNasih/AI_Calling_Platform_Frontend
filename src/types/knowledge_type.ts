export interface KnowledgeBaseSummaryType {
  summary: {
    total_files: number;
    active_files: number;
    inactive_files: number;
    processed_files: number;
    processing_files: number;
    failed_files: number;
    total_chunks: number;
    recent_uploads: number;
  };
  status_breakdown: {
    uploaded: number;
    processing: number;
    processed: number;
    failed: number;
    active: number;
    inactive: number;
  };
  processing_status: {
    completion_rate: number;
    failure_rate: number;
    currently_processing: number;
  };
  last_updated: string;
}

export interface KnowledgeBaseDocumentSummaryType {
  documents: {
    id: number;
    filename: string;
    file_type: string;
    file_size: number | null;
    status: string;
    is_active: boolean;
    processing_progress: number;
    chunk_count: number;
    uploaded_at: string;
    processed_at: string | null;
    last_accessed_at: string | null;
    error_message: string | null;
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  filters: {
    status: string | null;
    is_active: boolean | null;
  };
}
