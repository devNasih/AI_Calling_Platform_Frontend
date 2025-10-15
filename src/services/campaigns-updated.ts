import { apiClient } from './api';
import { 
  Campaign, 
  CampaignStartRequest, 
  CampaignApiResponse, 
  CampaignAction,
  ContactApiResponse 
} from '../types';

export interface CampaignFilters {
  status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  search?: string;
  page?: number;
  limit?: number;
}

export const campaignsService = {
  // Start a campaign - matches POST /v1/campaigns/start
  startCampaign: async (
    campaignName: string, 
    message: string, 
    region: string = 'global', 
    contactList: ContactApiResponse[]
  ): Promise<CampaignApiResponse> => {
    console.log('🚀 Starting campaign:', campaignName);
    
    try {
      const payload: CampaignStartRequest = {
        campaign_name: campaignName,
        message: message,
        region: region,
        contact_list: contactList
      };
      
      const response = await apiClient.post<CampaignApiResponse>('/v1/campaigns/start', payload);
      console.log('✅ Campaign started successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error starting campaign:', error);
      throw error;
    }
  },

  // Schedule a campaign - matches POST /v1/campaigns/schedule
  scheduleCampaign: async (
    name: string,
    message: string,
    region: string,
    startTime: string
  ): Promise<string> => {
    console.log('📅 Scheduling campaign:', name);
    
    try {
      const params = new URLSearchParams();
      params.append('name', name);
      params.append('message', message);
      params.append('region', region);
      params.append('start_time', startTime);

      const response = await apiClient.post<string>(`/v1/campaigns/schedule?${params}`);
      console.log('✅ Campaign scheduled successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error scheduling campaign:', error);
      throw error;
    }
  },

  // Control campaign - matches POST /v1/campaigns/control/{campaign_id}/{action}
  controlCampaign: async (campaignId: number, action: CampaignAction): Promise<string> => {
    console.log(`🎛️ ${action} campaign:`, campaignId);
    
    try {
      const response = await apiClient.post<string>(`/v1/campaigns/control/${campaignId}/${action}`);
      console.log(`✅ Campaign ${action} successful`);
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error ${action} campaign:`, error);
      throw error;
    }
  },

  // Pause campaign
  pauseCampaign: async (campaignId: number): Promise<string> => {
    return campaignsService.controlCampaign(campaignId, 'pause');
  },

  // Resume campaign
  resumeCampaign: async (campaignId: number): Promise<string> => {
    return campaignsService.controlCampaign(campaignId, 'resume');
  },

  // Stop campaign
  stopCampaign: async (campaignId: number): Promise<string> => {
    return campaignsService.controlCampaign(campaignId, 'stop');
  },

  // Note: The following methods are not supported by the current API
  // but are kept for compatibility with the frontend components

  // Get all campaigns (not supported by current API - returns empty array)
  getCampaigns: async (_filters: CampaignFilters = {}): Promise<{ data: Campaign[], total: number, totalPages: number }> => {
    console.warn('⚠️ getCampaigns: Not supported by current API');
    return {
      data: [],
      total: 0,
      totalPages: 0
    };
  },

  // Get single campaign by ID (not supported by current API)
  getCampaign: async (_id: string): Promise<Campaign> => {
    console.warn('⚠️ getCampaign: Not supported by current API');
    throw new Error('Getting individual campaigns is not supported by the current API.');
  },

  // Create new campaign (not supported by current API)
  createCampaign: async (_campaignData: any): Promise<Campaign> => {
    console.warn('⚠️ createCampaign: Not supported by current API. Use startCampaign or scheduleCampaign instead.');
    throw new Error('Creating campaigns is not supported. Use startCampaign or scheduleCampaign instead.');
  },

  // Update campaign (not supported by current API)
  updateCampaign: async (_id: string, _campaignData: any): Promise<Campaign> => {
    console.warn('⚠️ updateCampaign: Not supported by current API');
    throw new Error('Updating campaigns is not supported by the current API.');
  },

  // Delete campaign (not supported by current API)
  deleteCampaign: async (_id: string): Promise<void> => {
    console.warn('⚠️ deleteCampaign: Not supported by current API');
    throw new Error('Deleting campaigns is not supported by the current API.');
  },

  // Get campaign statistics (not supported by current API)
  getCampaignStats: async (_id: string) => {
    console.warn('⚠️ getCampaignStats: Not supported by current API');
    throw new Error('Campaign statistics are not supported by the current API.');
  },

  // Get campaign call logs (not supported by current API)
  getCampaignCalls: async (_id: string, _page: number = 1, _limit: number = 20) => {
    console.warn('⚠️ getCampaignCalls: Not supported by current API');
    throw new Error('Campaign call logs are not supported by the current API.');
  },
};
