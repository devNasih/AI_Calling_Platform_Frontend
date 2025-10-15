import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOutgoing,
  Activity,
  Clock,
  User,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Play,
  Brain,
  XCircle,
  PhoneCall,
} from "lucide-react";

// Type definitions
interface CallRecord {
  id: number;
  contact_name: string;
  contact_number: string;
  region: string;
  status: "completed" | "failed" | "no-answer";
  duration: number;
  timestamp: string;
  recording_url: string | null;
  ai_summary: string | null;
}

interface Stats {
  total: number;
  completed: number;
  failed: number;
  averageDuration: number;
}

// Dummy data
const dummyOutboundCalls: CallRecord[] = [
  {
    id: 1,
    contact_name: "John Smith",
    contact_number: "+1 (555) 123-4567",
    region: "US-East",
    status: "completed",
    duration: 245,
    timestamp: "2025-10-15T10:30:00Z",
    recording_url: "https://example.com/recording1.mp3",
    ai_summary:
      "Customer inquired about product features. Positive conversation, interested in premium plan.",
  },
  {
    id: 2,
    contact_name: "Sarah Johnson",
    contact_number: "+1 (555) 234-5678",
    region: "US-West",
    status: "completed",
    duration: 180,
    timestamp: "2025-10-15T09:15:00Z",
    recording_url: "https://example.com/recording2.mp3",
    ai_summary: null,
  },
  {
    id: 3,
    contact_name: "Michael Brown",
    contact_number: "+44 20 7123 4567",
    region: "UK",
    status: "failed",
    duration: 0,
    timestamp: "2025-10-15T08:45:00Z",
    recording_url: null,
    ai_summary: null,
  },
  {
    id: 4,
    contact_name: "Emily Davis",
    contact_number: "+1 (555) 345-6789",
    region: "US-Central",
    status: "completed",
    duration: 420,
    timestamp: "2025-10-14T16:20:00Z",
    recording_url: "https://example.com/recording4.mp3",
    ai_summary:
      "Follow-up call regarding previous inquiry. Scheduled demo for next week.",
  },
  {
    id: 5,
    contact_name: "David Wilson",
    contact_number: "+1 (555) 456-7890",
    region: "US-East",
    status: "no-answer",
    duration: 0,
    timestamp: "2025-10-14T14:10:00Z",
    recording_url: null,
    ai_summary: null,
  },
  {
    id: 6,
    contact_name: "Lisa Anderson",
    contact_number: "+61 2 1234 5678",
    region: "AU",
    status: "completed",
    duration: 315,
    timestamp: "2025-10-14T11:30:00Z",
    recording_url: "https://example.com/recording6.mp3",
    ai_summary: null,
  },
  {
    id: 7,
    contact_name: "Robert Taylor",
    contact_number: "+1 (555) 567-8901",
    region: "US-West",
    status: "completed",
    duration: 195,
    timestamp: "2025-10-14T09:00:00Z",
    recording_url: "https://example.com/recording7.mp3",
    ai_summary: "Customer service call. Resolved billing inquiry successfully.",
  },
  {
    id: 8,
    contact_name: "Jennifer Martinez",
    contact_number: "+1 (555) 678-9012",
    region: "US-Central",
    status: "failed",
    duration: 0,
    timestamp: "2025-10-13T15:45:00Z",
    recording_url: null,
    ai_summary: null,
  },
];

const OutboundCalls: React.FC = () => {
  const [outboundCalls, setOutboundCalls] =
    useState<CallRecord[]>(dummyOutboundCalls);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingAI, setProcessingAI] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    failed: 0,
    averageDuration: 0,
  });

  const updateStats = (callsData: CallRecord[]) => {
    const completed = callsData.filter((call) => call.status === "completed");
    const failed = callsData.filter(
      (call) => call.status === "failed" || call.status === "no-answer"
    );

    const totalDuration = completed.reduce(
      (sum, call) => sum + (call.duration || 0),
      0
    );
    const averageDuration =
      completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;

    setStats({
      total: callsData.length,
      completed: completed.length,
      failed: failed.length,
      averageDuration,
    });
  };

  const loadOutboundCalls = () => {
    setLoading(true);
    setTimeout(() => {
      setOutboundCalls(dummyOutboundCalls);
      updateStats(dummyOutboundCalls);
      setLoading(false);
    }, 500);
  };

  const handleProcessAI = (call: CallRecord) => {
    if (!call.recording_url) {
      alert("No recording available for AI processing");
      return;
    }

    setProcessingAI(call.id);
    setTimeout(() => {
      setOutboundCalls((prev) =>
        prev.map((c) =>
          c.id === call.id
            ? {
                ...c,
                ai_summary:
                  "AI analysis completed. Call was professional and covered all key points.",
              }
            : c
        )
      );
      setProcessingAI(null);
      alert("AI processing completed successfully!");
    }, 2000);
  };

  const handleMakeCall = () => {
    alert("Opening make call dialog...");
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "no-answer":
        return <XCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "no-answer":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  useEffect(() => {
    updateStats(dummyOutboundCalls);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outbound Calls</h1>
          <p className="text-gray-600">Manage and track your outgoing calls</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleMakeCall}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Make Call
          </button>
          <button
            onClick={loadOutboundCalls}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Total Outbound
            </span>
            <PhoneOutgoing className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Completed</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Failed/No Answer
            </span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Avg Duration
            </span>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">
            {formatDuration(stats.averageDuration)}
          </div>
        </div>
      </div>

      {/* Outbound Calls List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Outbound Calls
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : outboundCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PhoneOutgoing className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No outbound calls found</p>
              <p className="text-sm mt-2">
                Click "Make Call" to start a new outbound call
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {outboundCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {call.contact_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {call.contact_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDateTime(call.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {call.region}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {getStatusIcon(call.status)}
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            call.status
                          )}`}
                        >
                          {call.status}
                        </span>
                      </div>

                      {call.duration > 0 && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(call.duration)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* AI Summary */}
                    {call.ai_summary && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-blue-600 text-sm font-medium mb-1">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Analysis
                        </div>
                        <p className="text-sm text-gray-700">
                          {call.ai_summary}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {call.recording_url && (
                      <button
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        onClick={() =>
                          window.open(call.recording_url ?? "", "_blank")
                        }
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </button>
                    )}

                    {call.recording_url && !call.ai_summary && (
                      <button
                        className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                        onClick={() => handleProcessAI(call)}
                        disabled={processingAI === call.id}
                      >
                        {processingAI === call.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-3 h-3 mr-1" />
                            Analyze
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutboundCalls;
