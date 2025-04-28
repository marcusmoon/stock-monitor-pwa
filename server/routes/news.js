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

router.get('/news', async (req, res) => {
  try {
    const { symbol } = req.query;
    let newsData = [];

    if (symbol) {
      // 특정 주식에 대한 정보
      console.log(`Fetching info for symbol: ${symbol}`);
      const quote = await yahooFinance.quote(symbol);
      const news = await yahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'price', 'summaryProfile', 'financialData']
      });
      
      // 주식 상태 정보
      newsData = [{
        id: `${symbol}-price`,
        title: `[${symbol}] ${quote.longName || quote.shortName} Stock Update`,
        description: `Current Price: ${quote.regularMarketPrice} (${quote.regularMarketChangePercent}%) | 52W High: ${quote.fiftyTwoWeekHigh} | 52W Low: ${quote.fiftyTwoWeekLow}`,
        url: `https://finance.yahoo.com/quote/${symbol}`,
        publishedAt: new Date().toISOString(),
        source: 'Yahoo Finance'
      }];

      // 거래량 정보
      if (news && news.summaryDetail) {
        newsData.push({
          id: `${symbol}-volume`,
          title: `[${symbol}] Trading Volume Update`,
          description: `Volume: ${news.summaryDetail.volume.toLocaleString()} | Avg Volume: ${news.summaryDetail.averageVolume?.toLocaleString() || 'N/A'} | Bid: ${news.summaryDetail.bid} | Ask: ${news.summaryDetail.ask}`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          publishedAt: new Date().toISOString(),
          source: 'Yahoo Finance'
        });
      }

      // 주요 지표
      if (news && news.defaultKeyStatistics) {
        newsData.push({
          id: `${symbol}-stats`,
          title: `[${symbol}] Key Statistics`,
          description: `Market Cap: ${(news.defaultKeyStatistics.marketCap / 1e9).toFixed(2)}B | P/E Ratio: ${news.defaultKeyStatistics.forwardPE?.toFixed(2) || 'N/A'} | EPS: ${news.defaultKeyStatistics.forwardEps?.toFixed(2) || 'N/A'} | Dividend Yield: ${(news.defaultKeyStatistics.dividendYield * 100)?.toFixed(2) || 'N/A'}%`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          publishedAt: new Date().toISOString(),
          source: 'Yahoo Finance'
        });
      }

      // 회사 프로필
      if (news && news.summaryProfile) {
        newsData.push({
          id: `${symbol}-profile`,
          title: `[${symbol}] Company Profile`,
          description: `Sector: ${news.summaryProfile.sector || 'N/A'} | Industry: ${news.summaryProfile.industry || 'N/A'} | Employees: ${news.summaryProfile.fullTimeEmployees?.toLocaleString() || 'N/A'}`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          publishedAt: new Date().toISOString(),
          source: 'Yahoo Finance'
        });
      }

      // 재무 데이터
      if (news && news.financialData) {
        newsData.push({
          id: `${symbol}-financial`,
          title: `[${symbol}] Financial Data`,
          description: `Profit Margin: ${(news.financialData.profitMargins * 100)?.toFixed(2) || 'N/A'}% | Operating Margin: ${(news.financialData.operatingMargins * 100)?.toFixed(2) || 'N/A'}% | ROE: ${(news.financialData.returnOnEquity * 100)?.toFixed(2) || 'N/A'}% | ROA: ${(news.financialData.returnOnAssets * 100)?.toFixed(2) || 'N/A'}%`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          publishedAt: new Date().toISOString(),
          source: 'Yahoo Finance'
        });
      }
    } else {
      // 전체 시장 정보
      console.log('Fetching info for all symbols');
      const allNews = await Promise.all(
        WATCHLIST.map(async (symbol) => {
          try {
            console.log(`Fetching info for ${symbol}`);
            const quote = await yahooFinance.quote(symbol);
            const news = await yahooFinance.quoteSummary(symbol, {
              modules: ['summaryDetail', 'defaultKeyStatistics', 'price', 'summaryProfile', 'financialData']
            });
            
            const symbolNews = [{
              id: `${symbol}-price`,
              title: `[${symbol}] ${quote.longName || quote.shortName} Stock Update`,
              description: `Current Price: ${quote.regularMarketPrice} (${quote.regularMarketChangePercent}%) | 52W High: ${quote.fiftyTwoWeekHigh} | 52W Low: ${quote.fiftyTwoWeekLow}`,
              url: `https://finance.yahoo.com/quote/${symbol}`,
              publishedAt: new Date().toISOString(),
              source: 'Yahoo Finance'
            }];

            if (news && news.summaryDetail) {
              symbolNews.push({
                id: `${symbol}-volume`,
                title: `[${symbol}] Trading Volume Update`,
                description: `Volume: ${news.summaryDetail.volume.toLocaleString()} | Avg Volume: ${news.summaryDetail.averageVolume?.toLocaleString() || 'N/A'} | Bid: ${news.summaryDetail.bid} | Ask: ${news.summaryDetail.ask}`,
                url: `https://finance.yahoo.com/quote/${symbol}`,
                publishedAt: new Date().toISOString(),
                source: 'Yahoo Finance'
              });
            }

            if (news && news.defaultKeyStatistics) {
              symbolNews.push({
                id: `${symbol}-stats`,
                title: `[${symbol}] Key Statistics`,
                description: `Market Cap: ${(news.defaultKeyStatistics.marketCap / 1e9).toFixed(2)}B | P/E Ratio: ${news.defaultKeyStatistics.forwardPE?.toFixed(2) || 'N/A'} | EPS: ${news.defaultKeyStatistics.forwardEps?.toFixed(2) || 'N/A'} | Dividend Yield: ${(news.defaultKeyStatistics.dividendYield * 100)?.toFixed(2) || 'N/A'}%`,
                url: `https://finance.yahoo.com/quote/${symbol}`,
                publishedAt: new Date().toISOString(),
                source: 'Yahoo Finance'
              });
            }

            if (news && news.summaryProfile) {
              symbolNews.push({
                id: `${symbol}-profile`,
                title: `[${symbol}] Company Profile`,
                description: `Sector: ${news.summaryProfile.sector || 'N/A'} | Industry: ${news.summaryProfile.industry || 'N/A'} | Employees: ${news.summaryProfile.fullTimeEmployees?.toLocaleString() || 'N/A'}`,
                url: `https://finance.yahoo.com/quote/${symbol}`,
                publishedAt: new Date().toISOString(),
                source: 'Yahoo Finance'
              });
            }

            if (news && news.financialData) {
              symbolNews.push({
                id: `${symbol}-financial`,
                title: `[${symbol}] Financial Data`,
                description: `Profit Margin: ${(news.financialData.profitMargins * 100)?.toFixed(2) || 'N/A'}% | Operating Margin: ${(news.financialData.operatingMargins * 100)?.toFixed(2) || 'N/A'}% | ROE: ${(news.financialData.returnOnEquity * 100)?.toFixed(2) || 'N/A'}% | ROA: ${(news.financialData.returnOnAssets * 100)?.toFixed(2) || 'N/A'}%`,
                url: `https://finance.yahoo.com/quote/${symbol}`,
                publishedAt: new Date().toISOString(),
                source: 'Yahoo Finance'
              });
            }

            return symbolNews;
          } catch (error) {
            console.error(`Error fetching info for ${symbol}:`, error);
            return [];
          }
        })
      );
      
      newsData = allNews.flat().sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    console.log('Final news data:', JSON.stringify(newsData, null, 2));
    res.json(newsData);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router; 