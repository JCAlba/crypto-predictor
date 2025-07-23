const express = require('express');
const cors = require('cors');
const predictionsRoute = require('./routes/predictions');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS for local dev and Docker
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/predictions', predictionsRoute);

// Simple health check
app.get('/', (req, res) => {
  res.send('Backend server listening on port ' + PORT);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
