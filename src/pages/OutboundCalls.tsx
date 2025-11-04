import React, { useEffect, useState } from "react";
import {
  Phone,
  PhoneOutgoing,
  Activity,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Brain,
  Play,
} from "lucide-react";
import { useOutboundCalls } from "../contexts/OutboundCallsContext";
import { OutboundCallType } from "../types/outbound_calls_type";

interface Stats {
  total: number;
  completed: number;
  failed: number;
  averageDuration: number;
}

const OutboundCalls: React.FC = () => {
  const { calls, loading, error } = useOutboundCalls();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    failed: 0,
    averageDuration: 0,
  });

  // 🧮 Compute stats
  const updateStats = (callsData: OutboundCallType[]) => {
    const completed = callsData.filter((call) => call.status === "completed");
    const failed = callsData.filter(
      (call) => call.status === "failed" || call.status === "no_answer"
    );
    const totalDuration = completed.reduce(
      (sum, call) => sum + (call.duration?.seconds || 0),
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

  useEffect(() => {
    if (calls.length > 0) updateStats(calls);
  }, [calls]);


  const formatDuration = (seconds: number | null): string => {
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
      case "no_answer":
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
      case "no_answer":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

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
          ) : calls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PhoneOutgoing className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No outbound calls found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div
                  key={call.call_id}
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
                            {call.phone_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDateTime(call.timestamps.initiated_at)}
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

                      {call.duration?.seconds ? (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(call.duration.seconds)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
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
