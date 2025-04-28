import React, { useEffect, useState } from 'react';
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
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockData {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

interface ChartOptions {
  symbol: string;
  period: string;
  interval: string;
}

const API_URL = 'https://stock-monitor-r9g93gfap-marcusmoons-projects.vercel.app/api';

const StockChart: React.FC = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1y');
  const [selectedInterval, setSelectedInterval] = useState<string>('1d');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const url = `${API_URL}/stock-history?symbol=${selectedSymbol}&period=${selectedPeriod}&interval=${selectedInterval}`;
        console.log('Fetching from URL:', url);
        const response = await axios.get(url);
        console.log('Response:', response.data);
        setStockData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [selectedSymbol, selectedPeriod, selectedInterval]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  const data = {
    labels: stockData.map((data) => data.date),
    datasets: [
      {
        label: 'Stock Price',
        data: stockData.map((data) => data.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
      {
        label: 'High',
        data: stockData.map((data) => data.high),
        borderColor: 'rgba(75, 192, 192, 0.3)',
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Low',
        data: stockData.map((data) => data.low),
        borderColor: 'rgba(255, 99, 132, 0.3)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedSymbol} Stock Price History`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const data = stockData[dataIndex];
            return [
              `Price: $${data.price.toFixed(2)}`,
              `Open: $${data.open.toFixed(2)}`,
              `High: $${data.high.toFixed(2)}`,
              `Low: $${data.low.toFixed(2)}`,
              `Volume: ${data.volume.toLocaleString()}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4 flex gap-4">
        <select
          className="border rounded p-2"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
        >
          <option value="AAPL">Apple</option>
          <option value="GOOGL">Google</option>
          <option value="MSFT">Microsoft</option>
          <option value="AMZN">Amazon</option>
          <option value="005930.KS">Samsung Electronics</option>
          <option value="035720.KS">Kakao</option>
        </select>
        <select
          className="border rounded p-2"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="1d">1 Day</option>
          <option value="5d">5 Days</option>
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
        </select>
        <select
          className="border rounded p-2"
          value={selectedInterval}
          onChange={(e) => setSelectedInterval(e.target.value)}
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="30m">30 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="1d">1 Day</option>
          <option value="1wk">1 Week</option>
          <option value="1mo">1 Month</option>
        </select>
      </div>
      <Line options={options} data={data} />
    </div>
  );
};

export default StockChart;