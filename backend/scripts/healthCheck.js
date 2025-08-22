const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🏥 BACKEND HEALTH CHECK');
console.log('======================\n');

const BACKEND_URL = process.env.BACKEND_URL || 'https://yistorik.in';
const API_BASE = `${BACKEND_URL}/api`;

async function checkBackendHealth() {
  console.log(`🔍 Checking backend at: ${BACKEND_URL}`);
  
  try {
    // 1. Check basic server health
    console.log('\n1. 🏥 Server Health Check...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Health-Check-Script'
        }
      });
      console.log('✅ Server is responding');
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response: ${JSON.stringify(healthResponse.data)}`);
    } catch (error) {
      console.log('❌ Server health check failed');
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }

    // 2. Check database connection
    console.log('\n2. 🗄️  Database Connection Check...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log('✅ Database connection successful');
      
      // Test a simple query
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`   Collections found: ${collections.length}`);
      collections.forEach(col => console.log(`   - ${col.name}`));
      
      await mongoose.disconnect();
    } catch (error) {
      console.log('❌ Database connection failed');
      console.log(`   Error: ${error.message}`);
    }

    // 3. Check API endpoints
    console.log('\n3. 🔌 API Endpoints Check...');
    
    const endpoints = [
      { name: 'Products', url: `${API_BASE}/products`, method: 'GET' },
      { name: 'Categories', url: `${API_BASE}/categories`, method: 'GET' },
      { name: 'Auth Status', url: `${API_BASE}/auth/me`, method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.name}...`);
        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          timeout: 10000,
          headers: {
            'User-Agent': 'Health-Check-Script',
            'Accept': 'application/json'
          },
          validateStatus: (status) => status < 500 // Accept 4xx as valid responses
        });
        
        console.log(`   ✅ ${endpoint.name}: ${response.status}`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`      Data: Array with ${response.data.length} items`);
        } else if (response.data && typeof response.data === 'object') {
          console.log(`      Data: Object with keys: ${Object.keys(response.data).join(', ')}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.message}`);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Error: ${error.response.data?.message || 'Unknown error'}`);
        }
      }
    }

    // 4. Check CORS headers
    console.log('\n4. 🌐 CORS Headers Check...');
    try {
      const corsResponse = await axios.options(`${API_BASE}/products`, {
        timeout: 10000,
        headers: {
          'Origin': 'https://www.yistorik.in',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ CORS preflight successful');
      console.log(`   Access-Control-Allow-Origin: ${corsResponse.headers['access-control-allow-origin']}`);
      console.log(`   Access-Control-Allow-Methods: ${corsResponse.headers['access-control-allow-methods']}`);
      console.log(`   Access-Control-Allow-Headers: ${corsResponse.headers['access-control-allow-headers']}`);
    } catch (error) {
      console.log('❌ CORS preflight failed');
      console.log(`   Error: ${error.message}`);
    }

    // 5. Check environment variables
    console.log('\n5. ⚙️  Environment Variables Check...');
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'NODE_ENV',
      'PORT'
    ];

    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Set`);
      } else {
        console.log(`   ❌ ${envVar}: Missing`);
      }
    });

    // 6. Performance check
    console.log('\n6. ⚡ Performance Check...');
    const startTime = Date.now();
    try {
      await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      console.log(`   ✅ Response time: ${responseTime}ms`);
      
      if (responseTime < 1000) {
        console.log('   🚀 Excellent performance');
      } else if (responseTime < 3000) {
        console.log('   ⚠️  Moderate performance');
      } else {
        console.log('   🐌 Slow performance - may need optimization');
      }
    } catch (error) {
      console.log(`   ❌ Performance check failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  console.log('\n🏁 Health check completed');
}

// Run the health check
checkBackendHealth().catch(console.error);
