import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneIncoming,
  Activity,
  Clock,
  User,
  MapPin,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
  Play,
  Brain
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { callsService } from '../services/calls';
import { CallHistoryRecord } from '../types';

const InboundCalls: React.FC = () => {
  const [inboundCalls, setInboundCalls] = useState<CallHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    averageDuration: 0
  });

  const loadInboundCalls = async () => {
    try {
      setLoading(true);
      // Load all calls and filter for inbound (you can modify this based on your backend)
      const callsData = await callsService.getCallHistory({ limit: 100 });
      
      // Filter or identify inbound calls - this logic may need to be adjusted based on your backend
      const inboundCallsData = callsData.filter(call => 
        call.provider === 'twilio' || call.region === 'inbound'
      );
      
      setInboundCalls(inboundCallsData);
      updateStats(inboundCallsData);
    } catch (error) {
      console.error('Error loading inbound calls:', error);
      toast.error('Failed to load inbound calls');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (callsData: CallHistoryRecord[]) => {
    const completed = callsData.filter(call => call.status === 'completed');
    const failed = callsData.filter(call => call.status === 'failed');
    
    const totalDuration = completed.reduce((sum, call) => sum + (call.duration || 0), 0);
    const averageDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;

    setStats({
      total: callsData.length,
      completed: completed.length,
      failed: failed.length,
      averageDuration
    });
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
      
      // Update the call in the list
      setInboundCalls(prev => 
        prev.map(c => 
          c.id === call.id 
            ? { ...c, ai_summary: result.summary || 'AI analysis completed' }
            : c
        )
      );
    } catch (error: any) {
      console.error('Error processing AI:', error);
      toast.error(error.message || 'Failed to process AI');
    } finally {
      setProcessingAI(null);
    }
  };

  const handleTestInbound = async () => {
    try {
      setLoading(true);
      const result = await callsService.handleInboundCall();
      toast.success('Inbound call handler tested successfully!');
      console.log('Inbound call test result:', result);
    } catch (error: any) {
      console.error('Error testing inbound call:', error);
      toast.error(error.message || 'Failed to test inbound call handler');
    } finally {
      setLoading(false);
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
        return <AlertCircle className="w-4 h-4 text-red-500" />;
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
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  useEffect(() => {
    loadInboundCalls();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbound Calls</h1>
          <p className="text-gray-600">Manage and analyze incoming calls</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleTestInbound}
            variant="outline"
            leftIcon={<Settings className="w-4 h-4" />}
            disabled={loading}
          >
            Test Handler
          </Button>
          <Button
            onClick={loadInboundCalls}
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inbound</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
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
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
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

      {/* Inbound Calls List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inbound Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : inboundCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PhoneIncoming className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No inbound calls found</p>
              <p className="text-sm mt-2">Inbound calls will appear here when received</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inboundCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{call.contact_name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {call.contact_number}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDateTime(call.timestamp)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">{call.region}</span>
                      </div>
                      
                      <div className="flex items-center">
                        {getStatusIcon(call.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </div>
                      
                      {call.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDuration(call.duration)}</span>
                        </div>
                      )}
                    </div>

                    {/* AI Summary */}
                    {call.ai_summary && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <div className="flex items-center text-blue-600 text-sm mb-1">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Analysis
                        </div>
                        <p className="text-sm text-gray-700">{call.ai_summary}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {call.recording_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Play className="w-3 h-3" />}
                        onClick={() => window.open(call.recording_url, '_blank')}
                      >
                        Play
                      </Button>
                    )}
                    
                    {call.recording_url && !call.ai_summary && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={processingAI === call.id ? 
                          <LoadingSpinner size="sm" /> : 
                          <Brain className="w-3 h-3" />
                        }
                        onClick={() => handleProcessAI(call)}
                        disabled={processingAI === call.id}
                      >
                        {processingAI === call.id ? 'Processing...' : 'Analyze'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InboundCalls;
