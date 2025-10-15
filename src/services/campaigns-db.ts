import { apiClient } from './api';
import { 
  CampaignDB, 
  CampaignDBCreate, 
  HTTPValidationError
} from '../types';

export interface CampaignDBFilters {
  status?: 'scheduled' | 'running' | 'paused' | 'stopped' | 'completed';
  search?: string;
  page?: number;
  limit?: number;
}

export const campaignsDBService = {
  // GET /v1/campaigns/db/ - Get All Campaigns
  getAllCampaigns: async (): Promise<CampaignDB[]> => {
    console.log('📊 Fetching all campaigns from database');
    
    try {
      const response = await apiClient.get<CampaignDB[]>('/v1/campaigns/db/');
      console.log('✅ Campaigns fetched successfully:', response.data.length);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching campaigns:', error);
      
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

  // POST /v1/campaigns/db/ - Create Campaign
  createCampaign: async (campaignData: CampaignDBCreate): Promise<CampaignDB> => {
    console.log('➕ Creating new campaign in database:', campaignData.name);
    
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
      console.log('✅ Campaign created successfully:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating campaign:', error);
      
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

  // GET /v1/campaigns/db/{campaign_id} - Get Campaign By Id
  getCampaignById: async (campaignId: number): Promise<CampaignDB> => {
    console.log('🔍 Fetching campaign by ID:', campaignId);
    
    try {
      const response = await apiClient.get<CampaignDB>(`/v1/campaigns/db/${campaignId}`);
      console.log('✅ Campaign fetched successfully:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching campaign:', error);
      
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

  // PUT /v1/campaigns/db/{campaign_id} - Update Campaign
  updateCampaign: async (campaignId: number, campaignData: CampaignDBCreate): Promise<CampaignDB> => {
    console.log('✏️ Updating campaign:', campaignId);
    
    try {
      const response = await apiClient.put<CampaignDB>(`/v1/campaigns/db/${campaignId}`, campaignData);
      console.log('✅ Campaign updated successfully:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating campaign:', error);
      
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

  // DELETE /v1/campaigns/db/{campaign_id} - Delete Campaign
  deleteCampaign: async (campaignId: number): Promise<string> => {
    console.log('🗑️ Deleting campaign:', campaignId);
    
    try {
      const response = await apiClient.delete<string>(`/v1/campaigns/db/${campaignId}`);
      console.log('✅ Campaign deleted successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting campaign:', error);
      
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

  // Convenience methods
  
  // Get campaigns with filters (client-side filtering)
  getCampaignsWithFilters: async (filters: CampaignDBFilters = {}): Promise<CampaignDB[]> => {
    const allCampaigns = await campaignsDBService.getAllCampaigns();
    
    let filteredCampaigns = allCampaigns;
    
    // Apply status filter
    if (filters.status) {
      filteredCampaigns = filteredCampaigns.filter(
        campaign => campaign.status === filters.status
      );
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(
        campaign => 
          campaign.name.toLowerCase().includes(searchLower) ||
          campaign.message.toLowerCase().includes(searchLower) ||
          campaign.region.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created_at (newest first)
    filteredCampaigns.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return filteredCampaigns;
  },

  // Get campaigns by status
  getCampaignsByStatus: async (status: 'scheduled' | 'running' | 'paused' | 'stopped' | 'completed'): Promise<CampaignDB[]> => {
    return campaignsDBService.getCampaignsWithFilters({ status });
  },

  // Get active campaigns (running or paused)
  getActiveCampaigns: async (): Promise<CampaignDB[]> => {
    const allCampaigns = await campaignsDBService.getAllCampaigns();
    return allCampaigns.filter(campaign => 
      campaign.status === 'running' || campaign.status === 'paused'
    );
  },

  // Get campaign statistics
  getCampaignStats: async () => {
    try {
      const campaigns = await campaignsDBService.getAllCampaigns();
      
      const stats = {
        total: campaigns.length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        running: campaigns.filter(c => c.status === 'running').length,
        paused: campaigns.filter(c => c.status === 'paused').length,
        stopped: campaigns.filter(c => c.status === 'stopped').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
      };
      
      console.log('📊 Campaign statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching campaign stats:', error);
      return {
        total: 0,
        scheduled: 0,
        running: 0,
        paused: 0,
        stopped: 0,
        completed: 0,
      };
    }
  },
};
