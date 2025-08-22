const axios = require('axios');
require('dotenv').config();

async function debugFrontendError() {
  console.log('🔍 DEBUGGING FRONTEND PRODUCT CREATION ERROR\n');
  
  const baseURL = process.env.BACKEND_URL || 'https://yistorik.in';
  console.log(`🌐 Backend URL: ${baseURL}\n`);
  
  // 1. Test basic connectivity
  console.log('1. 🌐 Testing Basic Connectivity...');
  try {
    const healthResponse = await axios.get(`${baseURL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Backend is reachable');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data)}`);
  } catch (healthError) {
    console.log('❌ Backend connectivity failed:');
    console.log(`   Error: ${healthError.message}`);
    console.log(`   Code: ${healthError.code}`);
    if (healthError.response) {
      console.log(`   Status: ${healthError.response.status}`);
      console.log(`   Data: ${JSON.stringify(healthError.response.data)}`);
    }
    return;
  }
  console.log('');
  
  // 2. Test auth endpoint
  console.log('2. 🔐 Testing Auth Endpoint...');
  try {
    const authTestResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword'
    }, { timeout: 10000 });
  } catch (authError) {
    if (authError.response && authError.response.status === 401) {
      console.log('✅ Auth endpoint is working (returned 401 as expected)');
    } else {
      console.log('❌ Auth endpoint issue:');
      console.log(`   Status: ${authError.response?.status}`);
      console.log(`   Message: ${authError.response?.data?.message}`);
    }
  }
  console.log('');
  
  // 3. Test categories endpoint (public)
  console.log('3. 📂 Testing Categories Endpoint...');
  try {
    const categoriesResponse = await axios.get(`${baseURL}/api/categories`, {
      timeout: 10000
    });
    console.log('✅ Categories endpoint working');
    console.log(`   Found ${categoriesResponse.data.length} categories`);
    categoriesResponse.data.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.name} (${cat._id})`);
    });
  } catch (catError) {
    console.log('❌ Categories endpoint failed:');
    console.log(`   Error: ${catError.message}`);
    console.log(`   Status: ${catError.response?.status}`);
  }
  console.log('');
  
  // 4. Test admin products endpoint (should fail without auth)
  console.log('4. 🔒 Testing Admin Products Endpoint (without auth)...');
  try {
    const adminResponse = await axios.get(`${baseURL}/api/admin/products`, {
      timeout: 10000
    });
    console.log('⚠️ Admin endpoint accessible without auth (security issue!)');
  } catch (adminError) {
    if (adminError.response && adminError.response.status === 401) {
      console.log('✅ Admin endpoint properly protected (401 without auth)');
    } else {
      console.log('❌ Admin endpoint error:');
      console.log(`   Status: ${adminError.response?.status}`);
      console.log(`   Message: ${adminError.response?.data?.message}`);
    }
  }
  console.log('');
  
  // 5. Common frontend errors and solutions
  console.log('🎯 COMMON PRODUCT CREATION ISSUES & SOLUTIONS:\n');
  
  console.log('❌ Issue 1: "Network Error" or "Request failed"');
  console.log('   Solutions:');
  console.log('   - Check if backend server is running');
  console.log('   - Verify BACKEND_URL in frontend .env');
  console.log('   - Check CORS configuration');
  console.log('   - Verify internet connectivity\n');
  
  console.log('❌ Issue 2: "401 Unauthorized"');
  console.log('   Solutions:');
  console.log('   - Check if user is logged in as admin');
  console.log('   - Verify JWT token is valid and not expired');
  console.log('   - Check Authorization header format');
  console.log('   - Verify admin role in user account\n');
  
  console.log('❌ Issue 3: "400 Bad Request" or "Validation failed"');
  console.log('   Solutions:');
  console.log('   - Check required fields: name, description, price, category');
  console.log('   - Verify category ID exists in database');
  console.log('   - Check SKU uniqueness');
  console.log('   - Validate GST rate (0-28%)');
  console.log('   - Check price is positive number\n');
  
  console.log('❌ Issue 4: "500 Internal Server Error"');
  console.log('   Solutions:');
  console.log('   - Check server logs for detailed error');
  console.log('   - Verify database connection');
  console.log('   - Check for missing environment variables');
  console.log('   - Verify all required models are imported\n');
  
  console.log('❌ Issue 5: "Duplicate key error"');
  console.log('   Solutions:');
  console.log('   - Use unique SKU for each product');
  console.log('   - Check if product name/slug already exists');
  console.log('   - Generate random SKU if not provided\n');
  
  console.log('🔧 DEBUGGING STEPS FOR FRONTEND:\n');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Network tab');
  console.log('3. Try creating a product');
  console.log('4. Check the failed request:');
  console.log('   - Request URL');
  console.log('   - Request headers (Authorization)');
  console.log('   - Request payload');
  console.log('   - Response status and message');
  console.log('5. Check Console tab for JavaScript errors');
  console.log('6. Verify form data before submission\n');
  
  console.log('🛠️ QUICK FIXES TO TRY:\n');
  console.log('1. Refresh the page and try again');
  console.log('2. Log out and log back in as admin');
  console.log('3. Clear browser cache and cookies');
  console.log('4. Try with a different browser');
  console.log('5. Check if all required fields are filled');
  console.log('6. Try creating a product with minimal data first\n');
  
  console.log('📋 MINIMAL PRODUCT DATA FOR TESTING:');
  console.log(JSON.stringify({
    name: 'Test Product',
    description: 'Test description',
    price: 29.99,
    category: 'CATEGORY_ID_HERE',
    sku: 'TEST-' + Date.now(),
    trackQuantity: true,
    quantity: 10,
    isActive: true,
    isFeatured: false,
    images: [],
    gstRate: 0,
    gstType: 'CGST_SGST',
    hsnCode: '',
    gstInclusive: false,
    taxable: true,
    sizes: [],
    sizeChart: { enabled: false, image: '', description: '', measurements: [] }
  }, null, 2));
}

// Run the debug
debugFrontendError().catch(console.error);
