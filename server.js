// Simple Express server to serve the React frontend application
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('Starting frontend server...');
console.log('Environment:', process.env.NODE_ENV);

// Path to the build directory
const distPath = path.join(__dirname, 'dist');
console.log(`Serving static files from: ${distPath}`);

// Serve static files from the dist directory
app.use(express.static(distPath));

// Handle all routes by serving index.html to allow React Router to handle routing
app.get('*', (req, res) => {
  console.log(`Serving index.html for route: ${req.url}`);
  res.sendFile(path.join(distPath, 'index.html'));
});

// Set the port, using environment variable or default to 10000
const PORT = process.env.PORT || 10000;

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Server is ready to handle requests!`);
});