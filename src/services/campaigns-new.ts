import { apiClient } from './api';
import { 
  CampaignDB,
  CampaignDBCreate,
  CampaignStartRequest, 
  CampaignApiResponse, 
  CampaignAction,
  ContactApiResponse 
} from '../types';

export interface CampaignFilters {
  status?: 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  search?: string;
  page?: number;
  limit?: number;
}

export const campaignsService = {
  // ============================================
  // Campaign Operations (Real-time execution)
  // ============================================

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

  // ============================================
  // Campaign Database Operations (CRUD)
  // ============================================

  // Get all campaigns - matches GET /v1/campaigns/db/
  getAllCampaigns: async (): Promise<CampaignDB[]> => {
    console.log('📋 Getting all campaigns from database');
    
    try {
      const response = await apiClient.get<CampaignDB[]>('/v1/campaigns/db/');
      console.log('✅ Campaigns retrieved successfully:', response.data.length);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting campaigns:', error);
      throw error;
    }
  },

  // Create campaign in database - matches POST /v1/campaigns/db/
  createCampaignDB: async (campaignData: CampaignDBCreate): Promise<CampaignDB> => {
    console.log('🏗️ Creating campaign in database:', campaignData.name);
    
    try {
      // Only send the required fields that backend expects
      const payload = {
        name: campaignData.name,
        message: campaignData.message,
        region: campaignData.region
        // DO NOT send: status, created_at, id - backend will set these
      };
      
      console.log('📤 Sending payload:', payload);
      const response = await apiClient.post<CampaignDB>('/v1/campaigns/db/', payload);
      console.log('✅ Campaign created successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating campaign:', error);
      throw error;
    }
  },

  // Get campaign by ID - matches GET /v1/campaigns/db/{campaign_id}
  getCampaignById: async (campaignId: number): Promise<CampaignDB> => {
    console.log('🔍 Getting campaign by ID:', campaignId);
    
    try {
      const response = await apiClient.get<CampaignDB>(`/v1/campaigns/db/${campaignId}`);
      console.log('✅ Campaign retrieved successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting campaign:', error);
      throw error;
    }
  },

  // Update campaign - matches PUT /v1/campaigns/db/{campaign_id}
  updateCampaign: async (campaignId: number, campaignData: CampaignDBCreate): Promise<CampaignDB> => {
    console.log('📝 Updating campaign:', campaignId);
    
    try {
      const response = await apiClient.put<CampaignDB>(`/v1/campaigns/db/${campaignId}`, campaignData);
      console.log('✅ Campaign updated successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating campaign:', error);
      throw error;
    }
  },

  // Delete campaign - matches DELETE /v1/campaigns/db/{campaign_id}
  deleteCampaign: async (campaignId: number): Promise<string> => {
    console.log('🗑️ Deleting campaign:', campaignId);
    
    try {
      const response = await apiClient.delete<string>(`/v1/campaigns/db/${campaignId}`);
      console.log('✅ Campaign deleted successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting campaign:', error);
      throw error;
    }
  },

  // ============================================
  // Convenience Methods
  // ============================================

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

  // Get campaigns with filters (client-side filtering for now)
  getCampaignsFiltered: async (filters: CampaignFilters = {}): Promise<{ data: CampaignDB[], total: number }> => {
    try {
      let campaigns = await campaignsService.getAllCampaigns();
      
      // Apply status filter
      if (filters.status) {
        campaigns = campaigns.filter(c => c.status === filters.status);
      }
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        campaigns = campaigns.filter(c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.message.toLowerCase().includes(searchLower) ||
          c.region.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedCampaigns = campaigns.slice(startIndex, endIndex);
      
      return {
        data: paginatedCampaigns,
        total: campaigns.length
      };
    } catch (error) {
      console.error('❌ Error getting filtered campaigns:', error);
      throw error;
    }
  }
};

export default campaignsService;
