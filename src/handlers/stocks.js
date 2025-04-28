const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const WATCHLIST = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', '005930.KS', '035720.KS']; // 국내외 주요 기업

const getStocks = async (event) => {
  try {
    const stockData = await Promise.all(
      WATCHLIST.map(async (symbol) => {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        const quote = response.data['Global Quote'];
        return {
          symbol,
          name: symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(stockData),
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'Failed to fetch stock data' }),
    };
  }
};

const getStockHistory = async (event) => {
  try {
    const { symbol } = event.queryStringParameters || {};
    if (!symbol) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'Symbol parameter is required' }),
      };
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    const timeSeries = response.data['Time Series (Daily)'];
    const historicalData = Object.entries(timeSeries).map(([date, data]) => ({
      date,
      price: parseFloat(data['4. close']),
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(historicalData),
    };
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'Failed to fetch stock history' }),
    };
  }
};

module.exports = {
  getStocks,
  getStockHistory,
}; 