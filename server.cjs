// Simple Express server using CommonJS syntax
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

console.log('Starting frontend server with CommonJS...');
console.log('Environment:', process.env.NODE_ENV);

// Backend URL - make sure this is correct and accessible
const backendUrl = process.env.BACKEND_URL || 'https://backend-6c5g.onrender.com';
console.log(`Will proxy API requests to: ${backendUrl}`);

// Special middleware for Google OAuth routes to enable proper logging
app.use('/api/users/google*', (req, res, next) => {
  console.log(`[OAUTH ROUTE] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Proxy all /api requests to the backend server
// IMPORTANT: This must be defined BEFORE the static file middleware
app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  secure: true,
  xfwd: true, // Add X-Forwarded headers
  followRedirects: true, // Follow redirects needed for OAuth flow
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${backendUrl}${req.url}`);
    
    // For OAuth routes, preserve all headers
    if (req.url.includes('/google')) {
      console.log('Preserving headers for OAuth request');
      Object.keys(req.headers).forEach(key => {
        proxyReq.setHeader(key, req.headers[key]);
      });
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response from backend for ${req.url}: ${proxyRes.statusCode}`);
    
    // For OAuth, log any redirect locations
    if (proxyRes.headers.location) {
      console.log(`Redirect location: ${proxyRes.headers.location}`);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end(`Proxy error: Could not connect to backend server at ${backendUrl}`);
  }
}));

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

// Handle all non-API routes by serving index.html to allow React Router to handle routing
app.get('*', (req, res) => {
  // Skip handling API requests (they should have been handled by the proxy middleware)
  if (req.url.startsWith('/api/')) {
    console.warn(`API request slipped through to catch-all handler: ${req.url}`);
    return res.status(404).send(`API endpoint not found: ${req.url}. Backend URL: ${backendUrl}`);
  }
  
  console.log(`Serving index.html for client route: ${req.url}`);
  res.sendFile(path.join(distPath, 'index.html'));
});

// Set the port, using environment variable or default to 10000
// Render automatically sets the PORT environment variable
const PORT = process.env.PORT || 10000;
console.log(`Will attempt to bind to port: ${PORT}`);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
  console.log(`API requests will be proxied to: ${backendUrl}`);
  console.log(`Server is ready to handle requests!`);
});