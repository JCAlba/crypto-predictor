const express = require('express');
const cors = require('cors');
const predictionsRoute = require('./routes/predictions');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/predictions', predictionsRoute);

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
