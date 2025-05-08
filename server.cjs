// Simple Express server using CommonJS syntax
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

console.log('Starting frontend server with CommonJS...');
console.log('Environment:', process.env.NODE_ENV);

// Path to the build directory
const distPath = path.join(__dirname, 'dist');
console.log(`Serving static files from: ${distPath}`);

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error(`ERROR: The 'dist' directory does not exist at: ${distPath}`);
  console.error('Make sure you have run "npm run build" before starting the server');
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// Handle all routes by serving index.html to allow React Router to handle routing
app.get('*', (req, res) => {
  console.log(`Serving index.html for route: ${req.url}`);
  res.sendFile(path.join(distPath, 'index.html'));
});

// Set the port, using environment variable or default to 10000
// Render automatically sets the PORT environment variable
const PORT = process.env.PORT || 10000;
console.log(`Will attempt to bind to port: ${PORT}`);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Server is ready to handle requests!`);
});