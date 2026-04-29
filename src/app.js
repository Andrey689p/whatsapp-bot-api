const express = require('express');
const cors = require('cors');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API operacional'
  });
});

app.use('/api/whatsapp', whatsappRoutes);

module.exports = app;