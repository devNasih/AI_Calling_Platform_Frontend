import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { DailyStats } from "../../types";

interface CallsChartProps {
  data: DailyStats[];
  type?: "line" | "bar";
  height?: number;
}

const CallsChart: React.FC<CallsChartProps> = ({
  data,
  type = "line",
  height = 300,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalCalls" fill="#3B82F6" name="Total Calls" />
          <Bar dataKey="successfulCalls" fill="#10B981" name="Successful" />
          <Bar dataKey="failedCalls" fill="#EF4444" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="totalCalls"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Total Calls"
        />
        <Line
          type="monotone"
          dataKey="successfulCalls"
          stroke="#10B981"
          strokeWidth={2}
          name="Successful"
        />
        <Line
          type="monotone"
          dataKey="failedCalls"
          stroke="#EF4444"
          strokeWidth={2}
          name="Failed"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface SentimentChartProps {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
  height?: number;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  data,
  height = 300,
}) => {
  const chartData = [
    { name: "Positive", value: data.positive, color: "#10B981" },
    { name: "Neutral", value: data.neutral, color: "#6B7280" },
    { name: "Negative", value: data.negative, color: "#EF4444" },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }}>Count: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CallsChart;
