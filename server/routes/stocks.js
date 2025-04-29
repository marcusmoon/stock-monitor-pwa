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
      interval: interval || '1d',
      range: period || '1y',
    };

    console.log('Fetching stock history with options:', { symbol, queryOptions });
    const result = await yahooFinance.chart(symbol, queryOptions);
    console.log('Received data:', result);
    
    const formattedData = result.quotes.map(item => ({
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