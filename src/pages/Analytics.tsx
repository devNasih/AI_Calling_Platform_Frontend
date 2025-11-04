import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Badge } from "../components/common/Badge";
import { useAnalytics } from "../contexts/AnalyticsContext";

const Analytics: React.FC = () => {
  const {
    summary,
    data,
    loading,
    error,
    refresh,
    exportData,
    filterAnalytics,
    exporting,
  } = useAnalytics();

  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button onClick={refresh} className="mt-3">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No data
  if (!summary || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        No analytics data available.
      </div>
    );
  }

  // Handle export
  const handleExport = async () => {
    await exportData(format, startDate, endDate);
  };

  // Handle filter
  const handleFilter = async () => {
    if (!startDate || !endDate) return;
    await filterAnalytics(startDate, endDate);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive platform analytics overview
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Button onClick={refresh} variant="outline">
            Refresh
          </Button>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <Button
              onClick={handleFilter}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Filter
            </Button>
          </div>

          {/* Export */}
          <div className="flex items-center gap-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as "csv" | "xlsx")}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
            </select>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.total_calls}
              </p>
            </div>
            <span className="text-green-600 text-xl">📞</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.successful_calls}
              </p>
            </div>
            <span className="text-blue-600 text-xl">✅</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.failed_calls}
              </p>
            </div>
            <span className="text-red-600 text-xl">❌</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Processed Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.ai_processed_calls}
              </p>
            </div>
            <span className="text-purple-600 text-xl">🤖</span>
          </div>
        </Card>
      </div>

      {/* Contacts & Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contacts Overview
          </h3>
          <p className="text-gray-600 mb-2">
            Total Contacts: {data.contacts.total_contacts}
          </p>
          <p className="text-gray-600">
            Active: {data.contacts.active_contacts} (
            {data.contacts.active_percentage}%)
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Campaign Summary
          </h3>
          <p className="text-gray-600 mb-2">
            Total Campaigns: {data.campaigns.total_campaigns}
          </p>
          <p className="text-gray-600">
            Running: {data.campaigns.status_breakdown.running}
          </p>
        </Card>
      </div>

      {/* Sentiment Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sentiment Distribution
        </h3>
        <div className="flex gap-6">
          <Badge variant="success">
            Positive: {data.sentiment_analysis.positive}
          </Badge>
          <Badge variant="warning">
            Neutral: {data.sentiment_analysis.neutral}
          </Badge>
          <Badge variant="danger">
            Negative: {data.sentiment_analysis.negative}
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
