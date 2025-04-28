require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stocksRouter = require('./routes/stocks');
const newsRouter = require('./routes/news');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', stocksRouter);
app.use('/api', newsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 