import React, { useState, useEffect } from 'react';
import {
  Phone,
  Filter,
  Download,
  Play,
  Clock,
  MapPin,
  User,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Brain
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/common/Button';
import Table, { TableColumn } from '../components/common/Table';
import SearchBox from '../components/common/SearchBox';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CallHistoryRecord, CallHistoryFilters } from '../types';
import { callsService } from '../services/calls';

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<CallHistoryRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [filters, setFilters] = useState<CallHistoryFilters>({
    limit: 50
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    initiated: 0,
    averageDuration: 0
  });

  const itemsPerPage = 20;

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      const callsData = await callsService.getCallHistory(filters);
      setCalls(callsData);
      updateStats(callsData);
      applyFiltersAndPagination(callsData, searchTerm);
    } catch (error) {
      console.error('Error loading call history:', error);
      toast.error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (callsData: CallHistoryRecord[]) => {
    const completed = callsData.filter(call => call.status === 'completed');
    const failed = callsData.filter(call => call.status === 'failed');
    const initiated = callsData.filter(call => call.status === 'initiated');
    
    const totalDuration = completed.reduce((sum, call) => sum + (call.duration || 0), 0);
    const averageDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;

    setStats({
      total: callsData.length,
      completed: completed.length,
      failed: failed.length,
      initiated: initiated.length,
      averageDuration
    });
  };

  const applyFiltersAndPagination = (callsData: CallHistoryRecord[], search: string) => {
    let filtered = [...callsData];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(call =>
        call.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        call.contact_number.includes(search) ||
        call.campaign_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCalls = filtered.slice(startIndex, endIndex);

    setFilteredCalls(paginatedCalls);
    setTotalPages(totalPages);
  };

  useEffect(() => {
    loadCallHistory();
  }, [filters]);

  useEffect(() => {
    applyFiltersAndPagination(calls, searchTerm);
  }, [calls, searchTerm, currentPage]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof CallHistoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadCallHistory();
  };

  const handleProcessAI = async (call: CallHistoryRecord) => {
    if (!call.recording_url) {
      toast.error('No recording available for AI processing');
      return;
    }

    setProcessingAI(call.id);
    try {
      const result = await callsService.processAI(call.id, call.recording_url);
      toast.success('AI processing completed successfully!');
      console.log('AI processing result:', result);
      
      // Reload call history to get updated AI summary
      setTimeout(() => {
        loadCallHistory();
      }, 2000);
    } catch (error: any) {
      console.error('Error processing AI:', error);
      toast.error(error.message || 'Failed to process AI');
    } finally {
      setProcessingAI(null);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'initiated':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'initiated':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const columns: TableColumn<CallHistoryRecord>[] = [
    {
      key: 'contact_name',
      label: 'Contact',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            {value}
          </div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <Phone className="w-3 h-3 mr-1" />
            {row.contact_number}
          </div>
        </div>
      )
    },
    {
      key: 'campaign_name',
      label: 'Campaign',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center">
          {getStatusIcon(value)}
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value) => (
        <div className="flex items-center text-gray-900">
          <Clock className="w-4 h-4 mr-1 text-gray-400" />
          {formatDuration(value)}
        </div>
      )
    },
    {
      key: 'region',
      label: 'Region',
      render: (value) => (
        <div className="flex items-center text-gray-900">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {value}
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value) => (
        <div className="text-sm">
          <div className="text-gray-900">{formatDateTime(value)}</div>
        </div>
      )
    },
    {
      key: 'recording_url',
      label: 'Recording',
      render: (value) => (
        value ? (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Play className="w-3 h-3" />}
            onClick={() => window.open(value, '_blank')}
          >
            Play
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">No recording</span>
        )
      )
    },
    {
      key: 'ai_summary',
      label: 'AI Analysis',
      render: (value, row) => (
        <div className="space-y-1">
          {value ? (
            <div className="max-w-xs">
              <div className="flex items-center text-green-600 text-sm mb-1">
                <Brain className="w-3 h-3 mr-1" />
                Analyzed
              </div>
              <p className="text-xs text-gray-600 truncate" title={value}>
                {value}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-gray-400 text-xs">Not analyzed</div>
              {row.recording_url && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={processingAI === row.id ? 
                    <LoadingSpinner size="sm" /> : 
                    <Brain className="w-3 h-3" />
                  }
                  onClick={() => handleProcessAI(row)}
                  disabled={processingAI === row.id}
                  className="text-xs"
                >
                  {processingAI === row.id ? 'Processing...' : 'Analyze'}
                </Button>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
          <p className="text-gray-600">View and analyze your call logs</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Initiated</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.initiated}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Campaign</Label>
              <Select
                value={filters.campaign_name || ''}
                onChange={(e) => handleFilterChange('campaign_name', e.target.value || undefined)}
              >
                <option value="">All Campaigns</option>
                {[...new Set(calls.map(call => call.campaign_name))].map(campaign => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <option value="">All Statuses</option>
                <option value="initiated">Initiated</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </Select>
            </div>
            
            <div>
              <Label>Region</Label>
              <Select
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
              >
                <option value="">All Regions</option>
                <option value="global">Global</option>
                <option value="india">India</option>
              </Select>
            </div>
            
            <div>
              <Label>Limit</Label>
              <Select
                value={filters.limit?.toString() || '50'}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value="25">25 calls</option>
                <option value="50">50 calls</option>
                <option value="100">100 calls</option>
                <option value="200">200 calls</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-4">
        <SearchBox
          onSearch={handleSearch}
          placeholder="Search by contact name, phone number, or campaign..."
        />
      </div>

      {/* Call History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Call Records ({filteredCalls.length} of {calls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No call records found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <>
              <Table
                data={filteredCalls}
                columns={columns}
                loading={loading}
              />
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallHistory;
