import { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from 'yahoo-finance2';

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
    const { symbol, period = '1y', interval = '1d' } = req.query;
    
    if (!symbol) {
      res.status(400).json({ error: 'Symbol parameter is required' });
      return;
    }

    console.log(`Fetching history for ${symbol}...`);
    
    // Yahoo Finance API 초기화
    const yahooFinanceInstance = yahooFinance.default;
    
    const queryOptions = {
      period1: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1년 전
      period2: new Date(),
      interval: interval as string
    };

    const result = await yahooFinanceInstance.historical(symbol as string, queryOptions);
    
    const historicalData = result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      price: item.close,
      volume: item.volume,
      high: item.high,
      low: item.low,
      open: item.open
    }));

    console.log(`Successfully fetched history for ${symbol}`);
    res.status(200).json(historicalData);
  } catch (error) {
    console.error('Error in stock history API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 