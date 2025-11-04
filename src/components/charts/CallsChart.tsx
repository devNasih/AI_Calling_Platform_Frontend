import React from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../contexts/DashboardContext';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const CallsChart: React.FC = () => {
  const { charts } = useDashboard();

  // ✅ Safe access with fallback
  const callData = charts?.charts?.calls;
  const outbound = callData?.outbound || [];
  const inbound = callData?.inbound || [];

  // ✅ Build labels (use timestamps from outbound or inbound)
  const labels =
    outbound.length > 0
      ? outbound.map((p) => new Date(p.timestamp).toLocaleDateString())
      : inbound.length > 0
      ? inbound.map((p) => new Date(p.timestamp).toLocaleDateString())
      : Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`); // fallback dummy labels

  // ✅ Fallback to zero if no data
  const outboundCounts = outbound.length > 0 ? outbound.map((p) => p.count) : Array(labels.length).fill(0);
  const inboundCounts = inbound.length > 0 ? inbound.map((p) => p.count) : Array(labels.length).fill(0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Outbound Calls',
        data: outboundCounts,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Inbound Calls',
        data: inboundCounts,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow h-[400px]">
      <h3 className="text-lg font-semibold mb-2">📞 Call Volume (Last 7 Days)</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default CallsChart;
