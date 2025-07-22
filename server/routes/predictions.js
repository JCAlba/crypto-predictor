const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch latest predictions from the last hour
router.get('/', async (req, res) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .gte('updated_at', oneHourAgo);

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch predictions' });
  }

  res.json(data);
});

module.exports = router;
