const express = require('express');
const bodyParser = require('body-parser');

// Instantiate Express server
const app = express();

// Define default server port
const port = process.env.PORT || 3000;

// Add bodyParser middleware to process POST requests
app.use(bodyParser.json());

// Define health check endpoint for smoke tests
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start Express server
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
