import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  TrendingUp,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bot,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDashboard } from '../../contexts/DashboardContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import CallsChart from '../../components/charts/CallsChart';
import SentimentChart from '../../components/charts/SentimentChart';

const Dashboard: React.FC = () => {
  const { overview, metrics, charts, loading, error, refreshDashboard } = useDashboard();

  const handleRefresh = async () => {
    await refreshDashboard();
    toast.success('Dashboard refreshed successfully!');
  };

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
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
          ></div>
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
                <div className="text-white">{icon}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p className="text-center text-lg font-medium">⚠️ Failed to load dashboard data: {error}</p>
      </div>
    );
  }

  const callMetrics = metrics?.call_metrics;
  const aiMetrics = metrics?.ai_metrics;
  const successRates = metrics?.success_rates;
  const campaignMetrics = metrics?.campaign_metrics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI Calling Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor your campaigns and call analytics in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="bg-white border-gray-200 hover:bg-gray-50"
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Campaigns"
          value={campaignMetrics?.total_campaigns || 0}
          icon={<Target className="h-6 w-6" />}
          gradient="from-blue-500 to-blue-600"
          delay={0.1}
        />
        <StatCard
          title="Active Campaigns"
          value={campaignMetrics?.active_campaigns || 0}
          icon={<Activity className="h-6 w-6" />}
          gradient="from-green-500 to-emerald-600"
          delay={0.2}
        />
        <StatCard
          title="Outbound Success Rate"
          value={`${successRates?.outbound_success_rate || 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          gradient="from-purple-500 to-indigo-600"
          delay={0.3}
        />
        <StatCard
          title="AI Processing Rate"
          value={`${aiMetrics?.ai_processing_rate || 0}%`}
          icon={<Bot className="h-6 w-6" />}
          gradient="from-orange-500 to-red-600"
          delay={0.4}
        />
      </div>

      {/* Call Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card hover gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls Today</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {callMetrics?.today.total || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls This Week</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {callMetrics?.week.total || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls This Month</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {callMetrics?.month.total || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CallsChart />
        <SentimentChart />
      </div>
    </div>
  );
};

export default Dashboard;
