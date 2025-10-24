import React from 'react';
import { Pie } from 'react-chartjs-2';
import { useDashboard } from '../../contexts/DashboardContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentChart: React.FC = () => {
  const { charts } = useDashboard();
  const sentiment = charts?.charts?.sentiment?.distribution || {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;

  const data = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Sentiment Distribution',
        data: [sentiment.positive, sentiment.neutral, sentiment.negative],
        backgroundColor: ['#22C55E', '#A3A3A3', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow h-[400px]">
      <h3 className="text-lg font-semibold mb-2">🧠 Sentiment Analysis</h3>
      <Pie data={data} options={options} />
    </div>
  );
};

export default SentimentChart;
