const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;

// Get stock history
router.get('/stock-history', async (req, res) => {
  try {
    const { symbol, period, interval } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const queryOptions = {
      period1: '2020-01-01',
      interval: interval || '1d',
    };

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
      
      queryOptions.period1 = startDate.toISOString().split('T')[0];
    }

    const result = await yahooFinance.historical(symbol, queryOptions);
    
    const formattedData = result.map(item => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

// Get stock quote
router.get('/stock-quote', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const quote = await yahooFinance.quote(symbol);
    
    res.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow
    });
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

module.exports = router; 