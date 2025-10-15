import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import CallsChart from '../components/charts/CallsChart';
import { analyticsService, type PlatformSummary, type CampaignStats } from '../services/analytics';

interface DateRange {
  startDate: string;
  endDate: string;
}

const Analytics: React.FC = () => {
  const [platformSummary, setPlatformSummary] = useState<PlatformSummary | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Load analytics data
  const loadAnalytics = async (useDateRange = false) => {
    try {
      setError(null);
      
      let data;
      if (useDateRange && dateRange.startDate && dateRange.endDate) {
        data = await analyticsService.getAnalyticsForDateRange(dateRange.startDate, dateRange.endDate);
      } else {
        data = await analyticsService.getComprehensiveAnalytics();
      }

      setPlatformSummary(data.summary);
      setCampaignStats(data.campaignStats);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  // Handle date range change
  const handleDateRangeSubmit = async () => {
    setLoading(true);
    await loadAnalytics(true);
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      setExportLoading(true);
      const blob = await analyticsService.exportAnalytics(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(err.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format percentage
  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Load data on component mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button 
            onClick={handleRefresh} 
            className="mt-3"
            disabled={refreshing}
          >
            {refreshing ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive platform and campaign analytics</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
                onChange={(e) => handleExport(e.target.value as any)}
                disabled={exportLoading}
                value=""
              >
                <option value="" disabled>Export Data</option>
                <option value="csv">Export as CSV</option>
                <option value="xlsx">Export as Excel</option>
                <option value="pdf">Export as PDF</option>
              </select>
              {exportLoading && (
                <div className="absolute right-2 top-2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
            <Button onClick={handleDateRangeSubmit} size="sm">
              Apply Filter
            </Button>
          </div>
        </Card>

        {/* Platform Summary */}
        {platformSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{(platformSummary.totalUsers || 0).toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👥</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{(platformSummary.totalCalls || 0).toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📞</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(platformSummary.successRate || 0)}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">✅</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(platformSummary.costThisMonth || 0)}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">💰</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Additional Platform Metrics */}
        {platformSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Campaigns:</span>
                  <span className="font-medium">{platformSummary.totalCampaigns || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Contacts:</span>
                  <span className="font-medium">{(platformSummary.totalContacts || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Call Duration:</span>
                  <span className="font-medium">{formatDuration(platformSummary.averageCallDuration || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Minutes:</span>
                  <span className="font-medium">{(platformSummary.totalMinutesUsed || 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Regions</h3>
              <div className="space-y-2">
                {(platformSummary.activeRegions && platformSummary.activeRegions.length > 0) ? (
                  platformSummary.activeRegions.map((region, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {region}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No active regions</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaign</h3>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">
                  {platformSummary.topPerformingCampaign?.name || 'No campaigns yet'}
                </div>
                <div className="text-sm text-gray-600">
                  Success Rate: {formatPercentage(platformSummary.topPerformingCampaign?.successRate || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  Total Calls: {(platformSummary.topPerformingCampaign?.totalCalls || 0).toLocaleString()}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Campaign Statistics */}
        {campaignStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.totalCampaigns || 0}</p>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{campaignStats.activeCampaigns || 0}</p>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{campaignStats.completedCampaigns || 0}</p>
                  <p className="text-sm text-gray-600">Completed Campaigns</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{campaignStats.pausedCampaigns || 0}</p>
                  <p className="text-sm text-gray-600">Paused Campaigns</p>
                </div>
              </Card>
            </div>

            {/* Campaign Performance Table */}
            {campaignStats.campaignPerformance && campaignStats.campaignPerformance.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Calls
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Region
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaignStats.campaignPerformance.map((campaign) => (
                        <tr key={campaign.campaignId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.campaignName || 'Unnamed Campaign'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={
                              campaign.status === 'active' ? 'success' :
                              campaign.status === 'completed' ? 'default' :
                              campaign.status === 'paused' ? 'warning' : 'outline'
                            }>
                              {campaign.status || 'unknown'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(campaign.totalCalls || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPercentage(campaign.successRate || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(campaign.totalCost || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.region || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Regional Statistics */}
            {campaignStats.regionalStats && campaignStats.regionalStats.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaignStats.regionalStats.map((region, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{region.region || 'Unknown Region'}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Calls:</span>
                          <span>{(region.totalCalls || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate:</span>
                          <span>{formatPercentage(region.successRate || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Duration:</span>
                          <span>{formatDuration(region.averageDuration || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Campaign Trends Chart */}
            {campaignStats.campaignTrends && campaignStats.campaignTrends.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Trends</h3>
                <CallsChart 
                  data={campaignStats.campaignTrends.map(trend => ({
                    date: trend.date || new Date().toISOString().split('T')[0],
                    totalCalls: trend.completedCalls || 0,
                    successfulCalls: Math.floor((trend.completedCalls || 0) * (trend.successRate || 0)),
                    failedCalls: (trend.completedCalls || 0) - Math.floor((trend.completedCalls || 0) * (trend.successRate || 0)),
                    averageDuration: 180 // Default duration in seconds
                  }))}
                />
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

export default Analytics;
