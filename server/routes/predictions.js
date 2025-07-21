const express = require('express');
const router = express.Router();
const axios = require('axios');

// Simple prediction logic (can be replaced with a real model later)
const predict = (currentPrice) => ({
  next_day: currentPrice * 1.02,
  next_week: currentPrice * 1.05,
  next_month: currentPrice * 1.15
});

router.get('/', async (req, res) => {
  try {
    // Get top 50 coins by market cap
    const { data: coins } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1
      }
    });

    // Build predictions for each coin
    const predictions = coins.map((coin) => {
      const { id, name, symbol, current_price, image } = coin;
      return {
        id,
        name,
        symbol,
        image,
        current_price,
        prediction: predict(current_price)
      };
    });

    res.json({ predictions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch top cryptocurrencies.' });
  }
});

module.exports = router;
