const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    // Fetch BTC example from CoinGecko
    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
      params: {
        vs_currency: 'usd',
        days: 30
      }
    });

    // Placeholder prediction logic (just latest price)
    const prediction = {
      next_day: data.prices.slice(-1)[0][1] * 1.02,
      next_week: data.prices.slice(-1)[0][1] * 1.05,
      next_month: data.prices.slice(-1)[0][1] * 1.15
    };

    res.json({ prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch or predict prices' });
  }
});

module.exports = router;
