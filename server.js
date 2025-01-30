const express = require('express');
const bodyParser = require('body-parser');

// Instantiate Express server
const app = express();

// Define default server port
const port = process.env.PORT || 3000;

// Add bodyParser middleware to process POST requests
app.use(bodyParser.json());

// Setup in-memory storage for testing
let items = [];

// Define health check endpoint for smoke tests
app.get('/health', (req, res) => {
  // Return status 200 (OK) to client
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Define endpoint to GET all items
app.get('/api/items', (req, res) => {
  // Return status 200 (OK) to client
  res.status(200).json({
    count: items.length,
    items: items
  });
});

// Define endpoint to POST a single item
app.post('/api/items', (req, res) => {
  // Assign item value to request body
  const item = req.body;

  // Add timestemp and ID to request
  const newItem = {
    id: Date.now(),
    ...item,
    createdAt: new Date().toISOString()
  };

  // Add it to the items array
  items.push(newItem);

  // Return 201 (Created) to client with new item
  res.status(201).json(newItem);
});

// Define endpoint to GET a single item by ID
app.get('/api/items/:id', (req, res) => {
  // Parse request parameters and find matching item by ID
  const item = items.find(i => i.id === parseInt(req.params.id));

  // Return a 404 if the item ID is not found
  if (!item) {
    return res.status(404).json({
      error: 'Item not found'
    });
  }

  // Otherwise, return a status 200 (OK) and the item to the client
  res.status(200).json(item);
});

// Define status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    timestamp: new Date().toISOString()
  });
});

// Start Express server
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
