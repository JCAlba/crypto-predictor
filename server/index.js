const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Crypto Predictor API Running');
});

// Use route module
const predictionsRoute = require('./routes/predictions');
app.use('/api/predictions', predictionsRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
