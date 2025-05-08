// Simple Express server to serve the React frontend application
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('Starting frontend server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL || 'not set');
console.log('Backend URL:', process.env.BACKEND_URL || 'not set');

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy API requests to the backend
const backendUrl = process.env.BACKEND_URL || 'https://backend-6c5g.onrender.com';
console.log(`Proxying /api requests to: ${backendUrl}`);

app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api': '/api' // Don't rewrite the path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${backendUrl}${req.url}`);
  }
}));

// Check if the dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error(`ERROR: The 'dist' directory does not exist at: ${distPath}`);
  console.error('Make sure you have run "npm run build" before starting the server');
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// Explicitly handle common asset paths to avoid 404s
const commonAssetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
app.get(`*`, (req, res, next) => {
  if (commonAssetExtensions.some(ext => req.url.endsWith(ext))) {
    // If the asset doesn't exist, continue to next handler
    const filePath = path.join(distPath, req.url);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    console.log(`Asset not found: ${filePath}`);
  }
  next();
});

// Handle all other routes by serving index.html to allow React Router to handle routing
app.get('*', (req, res) => {
  console.log(`Serving index.html for route: ${req.url}`);
  res.sendFile(path.join(distPath, 'index.html'));
});

// Set the port, using environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
  console.log(`Server is ready to handle requests!`);
});