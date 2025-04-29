import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, period, interval } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is not configured' });
    }

    // Determine the function based on interval
    let function_name = 'TIME_SERIES_DAILY';
    if (interval === '1m') {
      function_name = 'TIME_SERIES_INTRADAY';
    } else if (interval === '1wk') {
      function_name = 'TIME_SERIES_WEEKLY';
    }

    const url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${apiKey}&outputsize=full`;
    console.log('Fetching stock history from Alpha Vantage:', url);
    
    const response = await axios.get(url);
    console.log('Received data from Alpha Vantage');

    // Parse the response based on the function
    let timeSeries;
    if (function_name === 'TIME_SERIES_INTRADAY') {
      timeSeries = response.data['Time Series (1min)'];
    } else if (function_name === 'TIME_SERIES_DAILY') {
      timeSeries = response.data['Time Series (Daily)'];
    } else {
      timeSeries = response.data['Weekly Time Series'];
    }

    if (!timeSeries) {
      throw new Error('No data received from Alpha Vantage');
    }

    // Convert the data to the expected format
    const formattedData = Object.entries(timeSeries).map(([date, data]: [string, any]) => ({
      date: new Date(date).toISOString(),
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'])
    }));

    // Sort by date in ascending order
    formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter based on period
    if (period) {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '1w':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case '5y':
          startDate.setFullYear(now.getFullYear() - 5);
          break;
        default:
          startDate.setFullYear(now.getFullYear() - 1);
      }

      const filteredData = formattedData.filter(item => 
        new Date(item.date) >= startDate && new Date(item.date) <= now
      );

      res.json(filteredData);
    } else {
      res.json(formattedData);
    }
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
} 