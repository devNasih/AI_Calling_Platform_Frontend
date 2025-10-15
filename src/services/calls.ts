import { apiClient } from './api';
import { 
  CallHistoryRecord, 
  CallHistoryFilters, 
  InboundCallResponse, 
  ProcessAIRequest, 
  ProcessAIResponse,
  CallStatus,
  HTTPValidationError
} from '../types';

export const callsService = {
  // Get call history - matches GET /v1/calls/history
  getCallHistory: async (filters: CallHistoryFilters = {}): Promise<CallHistoryRecord[]> => {
    console.log('📞 Fetching call history with filters:', filters);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.campaign_name) params.append('campaign_name', filters.campaign_name);
      if (filters.status) params.append('status', filters.status);
      if (filters.region) params.append('region', filters.region);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<CallHistoryRecord[]>(`/v1/calls/history?${params}`);
      console.log('✅ Call history fetched successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching call history:', error);
      throw error;
    }
  },

  // Handle inbound call - matches POST /v1/calls/inbound
  handleInboundCall: async (callData?: any): Promise<InboundCallResponse> => {
    console.log('📞 Handling inbound call');
    
    try {
      const response = await apiClient.post<InboundCallResponse>('/v1/calls/inbound', callData || {});
      console.log('✅ Inbound call handled successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error handling inbound call:', error);
      throw error;
    }
  },

  // Process AI for completed call - matches POST /v1/calls/process-ai
  processAI: async (callId: number, audioUrl: string): Promise<ProcessAIResponse> => {
    console.log('🤖 Processing AI for call:', callId);
    
    try {
      const requestData: ProcessAIRequest = {
        call_id: callId,
        audio_url: audioUrl
      };

      const response = await apiClient.post<ProcessAIResponse>('/v1/calls/process-ai', requestData);
      console.log('✅ AI processing completed successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error processing AI:', error);
      
      // Handle HTTPValidationError from backend
      if (error.response?.data?.detail) {
        const validationError = error.response.data as HTTPValidationError;
        const errorMessage = validationError.detail
          .map(err => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
        throw new Error(`Validation Error: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  // Get call history by campaign
  getCallHistoryByCampaign: async (campaignName: string, limit: number = 50): Promise<CallHistoryRecord[]> => {
    return callsService.getCallHistory({ campaign_name: campaignName, limit });
  },

  // Get call history by status
  getCallHistoryByStatus: async (status: CallStatus, limit: number = 50): Promise<CallHistoryRecord[]> => {
    return callsService.getCallHistory({ status, limit });
  },

  // Get call history by region
  getCallHistoryByRegion: async (region: string, limit: number = 50): Promise<CallHistoryRecord[]> => {
    return callsService.getCallHistory({ region, limit });
  },
};
