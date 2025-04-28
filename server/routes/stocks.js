const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const router = express.Router();

const WATCHLIST = [
  'NVDA', // NVIDIA
  'AAPL', // Apple
  'GOOGL', // Google
  'TSLA', // Tesla
  '005490.KS', // POSCO Holdings
  '005930.KS'  // Samsung Electronics
];

router.get('/stocks', async (req, res) => {
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

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

router.get('/stock-history', async (req, res) => {
  try {
    const { symbol, period = '1y', interval = '1d' } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const queryOptions = {
      period1: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1년 전
      period2: new Date(),
      interval: interval
    };

    const result = await yahooFinance.historical(symbol, queryOptions);
    
    const historicalData = result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      price: item.close,
      volume: item.volume,
      high: item.high,
      low: item.low,
      open: item.open
    }));

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

// 새로운 엔드포인트: 주식 상세 정보
router.get('/stock-info', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const quote = await yahooFinance.quote(symbol);
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ['price', 'summaryDetail', 'defaultKeyStatistics']
    });

    const stockInfo = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      peRatio: quote.pe || quoteSummary.defaultKeyStatistics?.forwardPE,
      eps: quoteSummary.defaultKeyStatistics?.forwardEps,
      dividendYield: quoteSummary.summaryDetail?.dividendYield,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      currency: quote.currency
    };

    res.json(stockInfo);
  } catch (error) {
    console.error('Error fetching stock info:', error);
    res.status(500).json({ error: 'Failed to fetch stock info' });
  }
});

module.exports = router; 