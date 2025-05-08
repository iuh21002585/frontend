// Simple Express server to serve the React frontend application
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('Starting frontend server...');
console.log('Environment:', process.env.NODE_ENV);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Explicitly handle the auth-success route
app.get('/auth-success', (req, res) => {
  console.log('Auth success route accessed with query params:', req.query);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle all other routes by serving index.html to allow React Router to handle routing
app.get('*', (req, res) => {
  console.log(`Received request for: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Set the port, using environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});