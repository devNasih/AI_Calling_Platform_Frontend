import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import { rootApi } from '../../services/api';

interface SystemStatusProps {
  showTitle?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  message: string;
  timestamp: string;
  version?: string;
  responseTime?: number;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ 
  showTitle = true, 
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'checking',
    message: 'Checking system status...',
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Perform health check
  const performHealthCheck = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const result = await rootApi.healthCheck();
      const responseTime = Date.now() - startTime;

      setHealthStatus({
        ...result,
        responseTime
      });
      setLastChecked(new Date());
    } catch (error: any) {
      console.error('Health check failed:', error);
      setHealthStatus({
        status: 'unhealthy',
        message: 'Failed to connect to backend API',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh effect
  useEffect(() => {
    // Initial check
    performHealthCheck();

    // Set up auto refresh if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(performHealthCheck, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format response time
  const formatResponseTime = (responseTime?: number) => {
    if (!responseTime) return 'N/A';
    if (responseTime < 1000) return `${responseTime}ms`;
    return `${(responseTime / 1000).toFixed(2)}s`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'unhealthy':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'destructive';
      case 'checking':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <Button
            onClick={performHealthCheck}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className={`w-3 h-3 rounded-full ${
                healthStatus.status === 'healthy' ? 'bg-green-500' :
                healthStatus.status === 'unhealthy' ? 'bg-red-500' :
                'bg-yellow-500'
              }`} />
            )}
            <span className="font-medium">API Status:</span>
          </div>
          <Badge variant={getStatusBadgeVariant(healthStatus.status) as any}>
            {healthStatus.status.toUpperCase()}
          </Badge>
        </div>

        {/* Status Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Status Message</p>
              <p className={`text-sm ${getStatusColor(healthStatus.status)}`}>
                {healthStatus.message}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-sm text-gray-900">
                {formatResponseTime(healthStatus.responseTime)}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600">Last Checked</p>
              <p className="text-sm text-gray-900">
                {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
              </p>
            </div>
            
            {healthStatus.version && (
              <div>
                <p className="text-sm font-medium text-gray-600">API Version</p>
                <p className="text-sm text-gray-900">{healthStatus.version}</p>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Status as of {formatTimestamp(healthStatus.timestamp)}
            </p>
          </div>
        </div>

        {/* Auto Refresh Info */}
        {autoRefresh && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Auto-refreshing every {refreshInterval / 1000} seconds</span>
          </div>
        )}

        {/* API Endpoints Status */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">API Endpoints</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Root API (GET /)</span>
              <Badge variant={getStatusBadgeVariant(healthStatus.status) as any} className="text-xs">
                {healthStatus.status === 'healthy' ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Authentication APIs</span>
              <Badge variant="success" className="text-xs">Online</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Campaign APIs</span>
              <Badge variant="success" className="text-xs">Online</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contact APIs</span>
              <Badge variant="success" className="text-xs">Online</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Call APIs</span>
              <Badge variant="success" className="text-xs">Online</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Analytics APIs</span>
              <Badge variant="warning" className="text-xs">Mock Data</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemStatus;
