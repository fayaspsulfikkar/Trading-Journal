require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001; // use 3001 to avoid React default

app.use(cors());
app.use(express.json());

const tradesRouter = require('./routes/trades');
const journalsRouter = require('./routes/journals');

app.use('/api/trades', tradesRouter);
app.use('/api/journals', journalsRouter);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
