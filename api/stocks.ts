import { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from 'yahoo-finance2';

const WATCHLIST = [
  'NVDA', // NVIDIA
  'AAPL', // Apple
  'GOOGL', // Google
  'TSLA', // Tesla
  '005490.KS', // POSCO Holdings
  '005930.KS'  // Samsung Electronics
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const stockData = await Promise.all(
      WATCHLIST.map(async (symbol) => {
        const quote = await yahooFinance.quote(symbol);
        return {
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          marketCap: quote.marketCap,
          volume: quote.regularMarketVolume,
          currency: quote.currency
        };
      })
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.status(200).json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
} 