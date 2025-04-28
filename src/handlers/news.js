const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

const getNews = async (event) => {
  try {
    const { symbol } = event.queryStringParameters || {};
    const query = symbol ? `${symbol} stock` : 'stock market';

    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    );

    const articles = response.data.articles.map((article) => ({
      id: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(articles.slice(0, 10)), // 최근 10개의 뉴스만 반환
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'Failed to fetch news' }),
    };
  }
};

module.exports = {
  getNews,
}; 