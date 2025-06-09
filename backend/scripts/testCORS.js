const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

console.log('🧪 TESTING CORS CONFIGURATION');
console.log('==============================\n');

// Test the exact CORS configuration from server.js
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));

// Explicit CORS headers middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://localhost:5173',
    'https://localhost:5174',
    'https://yistorik.in',
    'https://www.yistorik.in',
    'http://yistorik.in',
    'http://www.yistorik.in',
    'https://new-yistorik.vercel.app',
    'https://new-yistorik-git-main-pratapaditya01s-projects.vercel.app',
    'https://new-yistorik-delta.vercel.app'
  ];

  const origin = req.headers.origin;
  console.log(`📡 Request from origin: ${origin}`);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ Origin allowed: ${origin}`);
  } else {
    console.log(`❌ Origin blocked: ${origin}`);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://localhost:5173',
    'https://localhost:5174',
    'https://yistorik.in',
    'https://www.yistorik.in',
    'http://yistorik.in',
    'http://www.yistorik.in',
    'https://new-yistorik.vercel.app',
    'https://new-yistorik-git-main-pratapaditya01s-projects.vercel.app',
    'https://new-yistorik-delta.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Test endpoints
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ status: 'OK', message: 'CORS test server running' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login endpoint requested');
  res.json({ message: 'Login endpoint working', cors: 'success' });
});

const PORT = 5002; // Different port to avoid conflicts

app.listen(PORT, () => {
  console.log(`🚀 CORS test server running on port ${PORT}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}/api/health`);
  console.log('\n📋 Allowed origins:');
  console.log('   - https://www.yistorik.in');
  console.log('   - https://yistorik.in');
  console.log('   - http://localhost:5173');
  console.log('   - http://localhost:5174');
  console.log('\n🧪 Test this with curl:');
  console.log(`   curl -H "Origin: https://www.yistorik.in" http://localhost:${PORT}/api/health`);
});
