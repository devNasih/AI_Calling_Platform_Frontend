import { apiClient } from './api';

// Types for the new analytics APIs
export interface PlatformSummary {
  totalUsers: number;
  totalCalls: number;
  totalCampaigns: number;
  totalContacts: number;
  successRate: number;
  averageCallDuration: number;
  totalMinutesUsed: number;
  costThisMonth: number;
  activeRegions: string[];
  topPerformingCampaign: {
    name: string;
    successRate: number;
    totalCalls: number;
  };
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  pausedCampaigns: number;
  campaignPerformance: CampaignPerformanceStats[];
  regionalStats: RegionalStats[];
  topCampaigns: TopCampaign[];
  campaignTrends: CampaignTrend[];
}

export interface CampaignPerformanceStats {
  campaignId: string;
  campaignName: string;
  status: 'active' | 'completed' | 'paused' | 'scheduled';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  averageDuration: number;
  totalCost: number;
  region: string;
  startDate: string;
  endDate?: string;
}

export interface RegionalStats {
  region: string;
  totalCalls: number;
  successfulCalls: number;
  averageDuration: number;
  successRate: number;
}

export interface TopCampaign {
  campaignName: string;
  successRate: number;
  totalCalls: number;
  region: string;
}

export interface CampaignTrend {
  date: string;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCalls: number;
  successRate: number;
}

export const analyticsService = {
  // Get platform summary - matches GET /v1/analytics/summary
  getPlatformSummary: async (): Promise<PlatformSummary> => {
    console.log('📊 Fetching platform summary...');
    
    try {
      const response = await apiClient.get<PlatformSummary>('/v1/analytics/summary');
      console.log('✅ Platform summary fetched successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching platform summary:', error);
      
      // Return fallback data if API is not available
      if (error.response?.status === 404) {
        console.log('ℹ️ Platform summary endpoint not implemented yet, returning mock data');
        return {
          totalUsers: 125,
          totalCalls: 1247,
          totalCampaigns: 8,
          totalContacts: 5432,
          successRate: 0.867,
          averageCallDuration: 185,
          totalMinutesUsed: 38952,
          costThisMonth: 1245.67,
          activeRegions: ['North America', 'Europe', 'Asia Pacific'],
          topPerformingCampaign: {
            name: 'Holiday Campaign 2024',
            successRate: 0.924,
            totalCalls: 567
          }
        };
      }
      
      throw error;
    }
  },

  // Get campaign statistics - matches GET /v1/analytics/campaign-stats
  getCampaignStats: async (): Promise<CampaignStats> => {
    console.log('📊 Fetching campaign statistics...');
    
    try {
      const response = await apiClient.get<CampaignStats>('/v1/analytics/campaign-stats');
      console.log('✅ Campaign statistics fetched successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching campaign statistics:', error);
      
      // Return fallback data if API is not available
      if (error.response?.status === 404) {
        console.log('ℹ️ Campaign stats endpoint not implemented yet, returning mock data');
        return {
          totalCampaigns: 8,
          activeCampaigns: 3,
          completedCampaigns: 4,
          pausedCampaigns: 1,
          campaignPerformance: [
            {
              campaignId: '1',
              campaignName: 'Holiday Promotion',
              status: 'active' as const,
              totalCalls: 245,
              successfulCalls: 198,
              failedCalls: 47,
              successRate: 0.808,
              averageDuration: 192,
              totalCost: 156.78,
              region: 'North America',
              startDate: '2024-12-01',
              endDate: '2024-12-31'
            },
            {
              campaignId: '2',
              campaignName: 'Customer Retention',
              status: 'completed' as const,
              totalCalls: 567,
              successfulCalls: 445,
              failedCalls: 122,
              successRate: 0.785,
              averageDuration: 178,
              totalCost: 289.34,
              region: 'Europe',
              startDate: '2024-11-15',
              endDate: '2024-11-30'
            }
          ],
          regionalStats: [
            {
              region: 'North America',
              totalCalls: 487,
              successfulCalls: 398,
              averageDuration: 185,
              successRate: 0.817
            },
            {
              region: 'Europe',
              totalCalls: 623,
              successfulCalls: 489,
              averageDuration: 172,
              successRate: 0.785
            },
            {
              region: 'Asia Pacific',
              totalCalls: 137,
              successfulCalls: 119,
              averageDuration: 201,
              successRate: 0.869
            }
          ],
          topCampaigns: [
            {
              campaignName: 'Holiday Promotion',
              successRate: 0.924,
              totalCalls: 567,
              region: 'North America'
            },
            {
              campaignName: 'Customer Retention',
              successRate: 0.867,
              totalCalls: 445,
              region: 'Europe'
            }
          ],
          campaignTrends: [
            {
              date: '2024-08-20',
              totalCampaigns: 6,
              activeCampaigns: 2,
              completedCalls: 89,
              successRate: 0.798
            },
            {
              date: '2024-08-21',
              totalCampaigns: 7,
              activeCampaigns: 3,
              completedCalls: 112,
              successRate: 0.821
            },
            {
              date: '2024-08-22',
              totalCampaigns: 7,
              activeCampaigns: 3,
              completedCalls: 134,
              successRate: 0.836
            },
            {
              date: '2024-08-23',
              totalCampaigns: 8,
              activeCampaigns: 3,
              completedCalls: 156,
              successRate: 0.867
            }
          ]
        };
      }
      
      throw error;
    }
  },

  // Get comprehensive analytics (combines both endpoints)
  getComprehensiveAnalytics: async (): Promise<{
    summary: PlatformSummary;
    campaignStats: CampaignStats;
  }> => {
    console.log('📊 Fetching comprehensive analytics...');
    
    try {
      const [summary, campaignStats] = await Promise.all([
        analyticsService.getPlatformSummary(),
        analyticsService.getCampaignStats()
      ]);

      return {
        summary,
        campaignStats
      };
    } catch (error: any) {
      console.error('❌ Error fetching comprehensive analytics:', error);
      throw error;
    }
  },

  // Get analytics for date range (if supported by backend)
  getAnalyticsForDateRange: async (startDate: string, endDate: string): Promise<{
    summary: PlatformSummary;
    campaignStats: CampaignStats;
  }> => {
    console.log('📊 Fetching analytics for date range:', { startDate, endDate });
    
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      const [summaryResponse, campaignStatsResponse] = await Promise.all([
        apiClient.get<PlatformSummary>(`/v1/analytics/summary?${params}`),
        apiClient.get<CampaignStats>(`/v1/analytics/campaign-stats?${params}`)
      ]);

      return {
        summary: summaryResponse.data,
        campaignStats: campaignStatsResponse.data
      };
    } catch (error: any) {
      console.error('❌ Error fetching analytics for date range:', error);
      
      // Fallback to regular analytics if date range not supported
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('ℹ️ Date range filtering not supported, falling back to regular analytics');
        return analyticsService.getComprehensiveAnalytics();
      }
      
      throw error;
    }
  },

  // Export analytics data (if supported by backend)
  exportAnalytics: async (format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> => {
    console.log('📊 Exporting analytics data...');
    
    try {
      const response = await apiClient.get(`/v1/analytics/export?format=${format}`, {
        responseType: 'blob'
      });

      console.log('✅ Analytics data exported successfully');
      return response.data as Blob;
    } catch (error: any) {
      console.error('❌ Error exporting analytics:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Analytics export feature is not available yet');
      }
      
      throw error;
    }
  }
};
