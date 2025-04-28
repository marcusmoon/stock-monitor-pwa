import { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const news = await yahooFinance.news(symbol as string, {
      count: 10
    });

    const formattedNews = news.map(item => ({
      title: item.title,
      link: item.link,
      publisher: item.publisher,
      publishedAt: item.providerPublishTime,
      summary: item.summary,
      type: item.type
    }));

    res.json(formattedNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
} 