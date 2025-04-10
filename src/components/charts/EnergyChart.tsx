import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Sample data - in production this would come from your API
const generateSampleData = () => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const energyLevels = labels.map(() => Math.floor(Math.random() * 40) + 60); // Random values between 60-100
  const focusLevels = labels.map(() => Math.floor(Math.random() * 40) + 60);

  return {
    labels,
    datasets: [
      {
        label: 'Energy Level',
        data: energyLevels,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Focus Level',
        data: focusLevels,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
      },
    ],
  };
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Weekly Energy & Focus Levels',
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        stepSize: 20,
      },
    },
  },
};

export const EnergyChart: React.FC = () => {
  const data = generateSampleData();

  return (
    <div className="w-full h-full min-h-[300px] p-4">
      <Line options={options} data={data} />
    </div>
  );
};
