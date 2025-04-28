import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface News {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

const API_URL = process.env.REACT_APP_API_URL;

const NewsList: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_URL}/news`);
        setNews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Related News</h2>
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="border-b pb-4">
            <h3 className="font-medium text-lg">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {item.title}
              </a>
            </h3>
            <p className="text-gray-600 mt-2">{item.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>{item.source}</span>
              <span className="mx-2">•</span>
              <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList; 