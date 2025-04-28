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
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Fetching stock data...');
    
    // Yahoo Finance API 초기화
    const yahooFinanceInstance = yahooFinance.default;
    
    const stockData = await Promise.all(
      WATCHLIST.map(async (symbol) => {
        try {
          console.log(`Fetching data for ${symbol}...`);
          const quote = await yahooFinanceInstance.quote(symbol);
          console.log(`Successfully fetched data for ${symbol}`);
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
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      })
    );

    // null 값 필터링
    const validStockData = stockData.filter(stock => stock !== null);
    
    if (validStockData.length === 0) {
      throw new Error('No valid stock data available');
    }

    console.log('Successfully fetched all stock data');
    res.status(200).json(validStockData);
  } catch (error) {
    console.error('Error in stocks API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 