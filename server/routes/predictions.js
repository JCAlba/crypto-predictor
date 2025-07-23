const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Set up Supabase client with env vars
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/predictions
// Fetches the latest predictions for each coin (only the most recent row per coin)
router.get('/', async (req, res) => {
  try {
    // Get predictions from the last hour, grouped by coin, only latest
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .gte('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Supabase fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch predictions' });
    }

    // Optionally: Only the most recent prediction per coin
    // (If you have multiple rows per coin within the last hour)
    // This step assumes that coin_id is unique for each coin.
    // If you want *all* rows from last hour, remove this deduplication.
    const latestByCoin = {};
    data.forEach((row) => {
      const key = row.coin_id || row.symbol || row.name;
      if (!latestByCoin[key] || new Date(row.updated_at) > new Date(latestByCoin[key].updated_at)) {
        latestByCoin[key] = row;
      }
    });

    // If you want ALL rows from the last hour, just return data instead
    // res.json(data);
    res.json(Object.values(latestByCoin));
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
