// Simple Express server using CommonJS syntax
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const https = require('https');
const axios = require('axios');

const app = express();

console.log('Starting frontend server with CommonJS...');
console.log('Environment:', process.env.NODE_ENV);

// Backend URL - make sure this is correct and accessible
const backendUrl = process.env.BACKEND_URL || 'https://backend-6c5g.onrender.com';
console.log(`Will proxy API requests to: ${backendUrl}`);

// Increase default timeout for requests
http.globalAgent.maxSockets = 50;
https.globalAgent.maxSockets = 50;
http.globalAgent.keepAlive = true;
https.globalAgent.keepAlive = true;

// Function to forward API requests directly when proxy fails
const handleApiDirectly = async (req, res) => {
  try {
    console.log(`Handling API request directly: ${req.method} ${req.url}`);
    
    const apiUrl = `${backendUrl}${req.url}`;
    console.log(`Forwarding to: ${apiUrl}`);
    
    // Forward the request to the backend
    const axiosConfig = {
      method: req.method,
      url: apiUrl,
      headers: {
        ...req.headers,
        host: new URL(backendUrl).host,
      },
      responseType: 'arraybuffer',
    };
    
    // Add request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      axiosConfig.data = req.body;
    }
    
    const response = await axios(axiosConfig);
    
    // Forward the backend's response back to the client
    Object.keys(response.headers).forEach(header => {
      // Skip certain headers that might cause issues
      if (!['content-length', 'connection', 'content-encoding'].includes(header.toLowerCase())) {
        res.setHeader(header, response.headers[header]);
      }
    });
    
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Direct API request failed:', error.message);
    
    // Send appropriate error response
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response ? error.response.data : error.message;
    
    res.status(statusCode).send({
      error: 'API request failed',
      message: errorMessage,
      backend: backendUrl
    });
  }
};

// Add a special direct handler for Google OAuth routes for extra reliability
app.get('/api/users/google', (req, res) => {
  console.log('Direct handling of Google OAuth request');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  
  // Redirect directly to the backend Google auth endpoint
  const redirectUrl = `${backendUrl}/api/users/google`;
  console.log(`Redirecting to: ${redirectUrl}`);
  res.redirect(redirectUrl);
});

// Handle API login separately for extra reliability
app.post('/api/users/login', express.json(), (req, res) => {
  handleApiDirectly(req, res);
});

// Proxy all other /api requests to the backend server
// IMPORTANT: This must be defined BEFORE the static file middleware
app.use('/api', express.json(), express.urlencoded({ extended: true }), createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  secure: true,
  xfwd: true, // Add X-Forwarded headers
  followRedirects: true, // Follow redirects needed for OAuth flow
  logLevel: 'debug',
  pathRewrite: path => path, // Keep the path as is
  timeout: 60000, // Increase timeout to 60 seconds
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${backendUrl}${req.url}`);
    
    // For OAuth routes, preserve all headers
    if (req.url.includes('/google')) {
      console.log('Preserving headers for OAuth request');
      Object.keys(req.headers).forEach(key => {
        proxyReq.setHeader(key, req.headers[key]);
      });
      
      // Add additional headers that might help
      proxyReq.setHeader('x-forwarded-host', new URL(backendUrl).host);
      proxyReq.setHeader('x-forwarded-proto', new URL(backendUrl).protocol.replace(':', ''));
    }
    
    // For requests with body (POST, PUT, PATCH)
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      // Update content-length
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // Write body to request
      proxyReq.write(bodyData);
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
    
    // Handle Google OAuth errors specially
    if (req.url.includes('/google')) {
      console.log('Error with Google OAuth request, redirecting to backend');
      return res.redirect(`${backendUrl}${req.url}`);
    }
    
    // Try direct handling as fallback for important API routes
    if (req.url.includes('/login') || req.url.includes('/users')) {
      return handleApiDirectly(req, res);
    }
    
    res.writeHead(500, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({
      error: 'Proxy error',
      message: `Could not connect to backend server at ${backendUrl}. Error: ${err.message}`,
      directUrl: `${backendUrl}${req.url}`
    }));
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
    return handleApiDirectly(req, res);
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