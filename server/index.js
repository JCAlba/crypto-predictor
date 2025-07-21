const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.send('Crypto Predictor API Running');
});

// Prediction route
const predictionsRoute = require('./routes/predictions');
app.use('/api/predictions', predictionsRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
