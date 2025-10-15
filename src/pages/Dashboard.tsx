import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Phone,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bot,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AnalyticsData, Campaign, Call } from '../types';
import CallsChart, { SentimentChart } from '../components/charts/CallsChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Mock data for demo purposes
const mockAnalytics: AnalyticsData = {
  totalCampaigns: 15,
  totalCalls: 2847,
  successRate: 89.3,
  averageCallDuration: 245,
  callsByStatus: {
    completed: 2542,
    failed: 187,
    pending: 118
  },
  dailyStats: [
    { date: '2025-08-21', totalCalls: 280, successfulCalls: 251, failedCalls: 29, averageDuration: 142 },
    { date: '2025-08-22', totalCalls: 345, successfulCalls: 309, failedCalls: 36, averageDuration: 156 },
    { date: '2025-08-23', totalCalls: 298, successfulCalls: 267, failedCalls: 31, averageDuration: 134 },
    { date: '2025-08-24', totalCalls: 412, successfulCalls: 369, failedCalls: 43, averageDuration: 189 },
    { date: '2025-08-25', totalCalls: 356, successfulCalls: 318, failedCalls: 38, averageDuration: 167 },
    { date: '2025-08-26', totalCalls: 389, successfulCalls: 347, failedCalls: 42, averageDuration: 178 },
    { date: '2025-08-27', totalCalls: 423, successfulCalls: 381, failedCalls: 42, averageDuration: 195 }
  ],
  sentimentDistribution: {
    positive: 65,
    neutral: 25,
    negative: 10
  },
  campaignPerformance: [
    {
      campaignId: '1',
      campaignName: 'Summer Sales Campaign',
      totalCalls: 1247,
      successfulCalls: 1118,
      successRate: 89.7,
      averageDuration: 186
    },
    {
      campaignId: '2',
      campaignName: 'Customer Feedback Survey',
      totalCalls: 892,
      successfulCalls: 803,
      successRate: 90.0,
      averageDuration: 142
    }
  ]
};

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Summer Sales Campaign',
    message: 'Hello! We have exciting summer offers for you...',
    status: 'running',
    region: 'North America',
    created_at: '2025-08-20T10:00:00Z'
  },
  {
    id: 2,
    name: 'Customer Feedback Survey',
    message: 'We value your feedback. Could you spare 2 minutes for a quick survey?',
    status: 'running',
    region: 'Europe',
    created_at: '2025-08-19T09:00:00Z'
  },
  {
    id: 3,
    name: 'Product Launch Announcement',
    message: 'Exciting news! We are launching our new product...',
    status: 'completed',
    region: 'Asia Pacific',
    created_at: '2025-08-18T08:00:00Z'
  },
  {
    id: 4,
    name: 'Holiday Promotion',
    message: 'Special holiday discounts are now available...',
    status: 'scheduled',
    region: 'Global',
    created_at: '2025-08-17T12:00:00Z'
  },
  {
    id: 5,
    name: 'Lead Qualification',
    message: 'Thank you for your interest. Let me ask a few questions...',
    status: 'running',
    region: 'North America',
    created_at: '2025-08-16T15:30:00Z'
  }
];

const mockCalls: Call[] = [
  {
    id: '1',
    campaignId: '1',
    contactId: '101',
    status: 'completed',
    duration: 186,
    startedAt: '2025-08-27T14:25:00Z',
    endedAt: '2025-08-27T14:28:06Z',
    retryCount: 0,
    createdAt: '2025-08-27T14:25:00Z',
    updatedAt: '2025-08-27T14:28:06Z'
  },
  {
    id: '2',
    campaignId: '2',
    contactId: '102',
    status: 'completed',
    duration: 142,
    startedAt: '2025-08-27T14:20:00Z',
    endedAt: '2025-08-27T14:22:22Z',
    retryCount: 0,
    createdAt: '2025-08-27T14:20:00Z',
    updatedAt: '2025-08-27T14:22:22Z'
  },
  {
    id: '3',
    campaignId: '1',
    contactId: '103',
    status: 'failed',
    duration: 45,
    startedAt: '2025-08-27T14:15:00Z',
    endedAt: '2025-08-27T14:15:45Z',
    retryCount: 1,
    createdAt: '2025-08-27T14:15:00Z',
    updatedAt: '2025-08-27T14:15:45Z'
  },
  {
    id: '4',
    campaignId: '3',
    contactId: '104',
    status: 'completed',
    duration: 234,
    startedAt: '2025-08-27T14:10:00Z',
    endedAt: '2025-08-27T14:13:54Z',
    retryCount: 0,
    createdAt: '2025-08-27T14:10:00Z',
    updatedAt: '2025-08-27T14:13:54Z'
  },
  {
    id: '5',
    campaignId: '2',
    contactId: '105',
    status: 'completed',
    duration: 198,
    startedAt: '2025-08-27T14:05:00Z',
    endedAt: '2025-08-27T14:08:18Z',
    retryCount: 0,
    createdAt: '2025-08-27T14:05:00Z',
    updatedAt: '2025-08-27T14:08:18Z'
  },
  {
    id: '6',
    campaignId: '5',
    contactId: '106',
    status: 'pending',
    duration: 0,
    retryCount: 0,
    createdAt: '2025-08-27T14:00:00Z',
    updatedAt: '2025-08-27T14:00:00Z'
  },
  {
    id: '7',
    campaignId: '1',
    contactId: '107',
    status: 'completed',
    duration: 167,
    startedAt: '2025-08-27T13:55:00Z',
    endedAt: '2025-08-27T13:57:47Z',
    retryCount: 0,
    createdAt: '2025-08-27T13:55:00Z',
    updatedAt: '2025-08-27T13:57:47Z'
  },
  {
    id: '8',
    campaignId: '4',
    contactId: '108',
    status: 'failed',
    duration: 23,
    startedAt: '2025-08-27T13:50:00Z',
    endedAt: '2025-08-27T13:50:23Z',
    retryCount: 2,
    createdAt: '2025-08-27T13:50:00Z',
    updatedAt: '2025-08-27T13:50:23Z'
  }
];

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      // Simulate loading delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, showRefreshing ? 800 : 1200));

      // Set mock data
      setAnalytics(mockAnalytics);
      setRecentCampaigns(mockCampaigns);
      setRecentCalls(mockCalls);

      if (showRefreshing) {
        toast.success('Dashboard data refreshed successfully!');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    gradient?: string;
    delay?: number;
  }> = ({ title, value, icon, change, changeType = 'neutral', gradient = 'from-blue-500 to-purple-600', delay = 0 }) => {
    const changeColors = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    };

    const changeIcons = {
      positive: <ArrowUpRight className="h-4 w-4" />,
      negative: <ArrowDownRight className="h-4 w-4" />,
      neutral: <Minus className="h-4 w-4" />
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card hover gradient className="group overflow-hidden relative">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                  {change && (
                    <div className={`flex items-center space-x-1 ${changeColors[changeType]}`}>
                      {changeIcons[changeType]}
                      <span className="text-sm font-medium">{change}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <div className="text-white">
                  {icon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI Calling Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor your campaigns and track performance in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            isLoading={refreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="bg-white border-gray-200 hover:bg-gray-50"
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Campaigns"
          value={analytics?.totalCampaigns || 15}
          icon={<Target className="h-6 w-6" />}
          change="+2 this week"
          changeType="positive"
          gradient="from-blue-500 to-blue-600"
          delay={0.1}
        />

        <StatCard
          title="Total Calls"
          value={(analytics?.totalCalls || 2847).toLocaleString()}
          icon={<Phone className="h-6 w-6" />}
          change="+12% from last month"
          changeType="positive"
          gradient="from-green-500 to-emerald-600"
          delay={0.2}
        />

        <StatCard
          title="Success Rate"
          value={`${(analytics?.successRate || 89.3).toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          change="+5.2% from last month"
          changeType="positive"
          gradient="from-purple-500 to-indigo-600"
          delay={0.3}
        />

        <StatCard
          title="AI Efficiency"
          value="94.2%"
          icon={<Bot className="h-6 w-6" />}
          change="+3.1% improvement"
          changeType="positive"
          gradient="from-orange-500 to-red-600"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card gradient className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Calls Trend (Last 7 Days)</span>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Daily Performance</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.dailyStats && analytics.dailyStats.length > 0 ? (
                <CallsChart data={analytics.dailyStats} type="line" height={280} />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                  <Activity className="h-12 w-12 mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm">Start a campaign to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sentiment Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card gradient className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Sentiment Analysis</span>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>AI Insights</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.sentimentDistribution ? (
                <SentimentChart data={analytics.sentimentDistribution} height={280} />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                  <Bot className="h-12 w-12 mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No sentiment data</p>
                  <p className="text-sm">Complete calls to see AI analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card hover gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Calls</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {analytics?.callsByStatus?.completed || 2542}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">
                +15% from yesterday
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Calls</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {analytics?.callsByStatus?.failed || 187}
              </p>
              <p className="text-xs text-red-600 font-medium mt-1">
                -8% from yesterday
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {recentCampaigns.filter(c => c.status === 'running').length}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                2 launching today
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card gradient>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Recent Campaigns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.length > 0 ? (
                  recentCampaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          campaign.status === 'running' ? 'bg-green-100' :
                          campaign.status === 'completed' ? 'bg-blue-100' :
                          campaign.status === 'scheduled' ? 'bg-yellow-100' :
                          'bg-gray-100'
                        }`}>
                          <Activity className={`h-4 w-4 ${
                            campaign.status === 'running' ? 'text-green-600' :
                            campaign.status === 'completed' ? 'text-blue-600' :
                            campaign.status === 'scheduled' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-500">
                          Status: <span className="font-medium capitalize">{campaign.status}</span> • Region: <span className="font-medium">{campaign.region}</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No recent campaigns</p>
                    <p className="text-xs text-gray-400">Create your first campaign to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Calls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card gradient>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-600" />
                <span>Recent Calls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalls.length > 0 ? (
                  recentCalls.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          call.status === 'completed' ? 'bg-green-100' :
                          call.status === 'failed' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          {call.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : call.status === 'failed' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Contact #{call.contactId}</p>
                        <p className="text-xs text-gray-500">
                          Duration: <span className="font-medium">{formatDuration(call.duration || 0)}</span> • 
                          Status: <span className="font-medium capitalize">{call.status}</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Phone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No recent calls</p>
                    <p className="text-xs text-gray-400">Start a campaign to begin making calls</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
