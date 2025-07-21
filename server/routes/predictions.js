const express = require('express');
const axios = require('axios');
const router = express.Router();

const PREDICTOR_URL = process.env.PREDICTOR_URL || 'http://predictor:5001';

// GET all predictions (no symbol param)
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${PREDICTOR_URL}/predict`);
    res.json(response.data);
  } catch (err) {
    console.error('Prediction error:', err.message);
    res.status(500).json({ error: 'Failed to fetch all predictions' });
  }
});

module.exports = router;
