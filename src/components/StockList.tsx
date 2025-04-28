import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  currency: string;
}

interface News {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

const API_URL = 'https://stock-monitor-r9g93gfap-marcusmoons-projects.vercel.app/api';

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}M`;
  }
  return marketCap.toString();
};

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<{ [key: string]: News[] }>({});
  const [expandedStocks, setExpandedStocks] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        console.log('Fetching stocks from:', `${API_URL}/stocks`);
        const response = await axios.get(`${API_URL}/stocks`);
        console.log('Stocks response:', response.data);
        
        if (!response.data || response.data.length === 0) {
          throw new Error('No stock data received');
        }

        setStocks(response.data);
        setError(null);
        setLoading(false);

        // 모든 주식에 대해 뉴스 가져오기
        for (const stock of response.data) {
          try {
            console.log(`Fetching news for ${stock.symbol}`);
            const newsResponse = await axios.get(`${API_URL}/news?symbol=${stock.symbol}`);
            console.log(`News response for ${stock.symbol}:`, newsResponse.data);
            
            if (newsResponse.data && newsResponse.data.length > 0) {
              setNews(prev => ({
                ...prev,
                [stock.symbol]: newsResponse.data
              }));
            }
          } catch (error) {
            console.error(`Error fetching news for ${stock.symbol}:`, error);
          }
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (symbol: string) => {
    setExpandedStocks(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Error: {error}</p>
        <p className="text-sm mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Stock List</h2>
        <div className="space-y-4">
          {stocks.map((stock) => (
            <div key={stock.symbol}>
              <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-medium">{stock.name}</h3>
                  <p className="text-sm text-gray-500">{stock.symbol}</p>
                  <p className="text-xs text-gray-400">
                    Vol: {stock.volume.toLocaleString()} | MCap: {formatMarketCap(stock.marketCap)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {stock.currency === 'KRW' ? '₩' : '$'}
                    {stock.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className={`text-sm ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.change >= 0 ? '+' : ''}
                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
              
              {/* 뉴스 섹션 */}
              {news[stock.symbol] && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Recent News ({news[stock.symbol].length})</h4>
                    {news[stock.symbol].length > 3 && (
                      <button
                        onClick={() => toggleExpand(stock.symbol)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {expandedStocks[stock.symbol] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {news[stock.symbol]
                      .slice(0, expandedStocks[stock.symbol] ? undefined : 3)
                      .map((item) => (
                        <div key={item.id} className="text-sm">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.title}
                          </a>
                          <p className="text-gray-600 mt-1">{item.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(item.publishedAt).toLocaleDateString()} - {item.source}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockList; 