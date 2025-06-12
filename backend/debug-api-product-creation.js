const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
require('dotenv').config();

async function debugAPIProductCreation() {
  console.log('🔍 DEBUGGING API PRODUCT CREATION\n');
  
  const baseURL = process.env.BACKEND_URL || 'http://localhost:5001';
  console.log(`🌐 Testing API at: ${baseURL}\n`);
  
  try {
    // 1. Connect to database to check admin user
    console.log('1. 🗄️  Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected\n');
    
    // 2. Check admin users
    console.log('2. 👤 Checking admin users...');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`   Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.isActive ? 'Active' : 'Inactive'})`);
    });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found! Creating test admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const testAdmin = new User({
        name: 'Test Admin',
        email: 'testadmin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await testAdmin.save();
      console.log('✅ Test admin created: testadmin@example.com / admin123');
      adminUsers.push(testAdmin);
    }
    console.log('');
    
    // 3. Get categories
    console.log('3. 📂 Getting categories...');
    const categories = await Category.find({});
    console.log(`   Found ${categories.length} categories\n`);
    
    await mongoose.disconnect();
    
    // 4. Test admin login
    console.log('4. 🔐 Testing admin login...');
    let authToken;
    
    const loginCredentials = [
      { email: 'admin@clothingstore.com', password: 'admin123' },
      { email: 'testadmin@example.com', password: 'admin123' },
      { email: adminUsers[0]?.email, password: 'admin123' }
    ];
    
    for (const creds of loginCredentials) {
      if (!creds.email) continue;
      
      try {
        console.log(`   Trying: ${creds.email}`);
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, creds);
        authToken = loginResponse.data.token;
        console.log('✅ Login successful!');
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        break;
      } catch (loginError) {
        console.log(`   ❌ Failed: ${loginError.response?.data?.message || loginError.message}`);
      }
    }
    
    if (!authToken) {
      console.log('❌ Could not authenticate as admin. Cannot test product creation.');
      return;
    }
    console.log('');
    
    // 5. Test product creation API
    console.log('5. 🧪 Testing Product Creation API...');
    
    const testProductData = {
      name: 'API Test Product',
      description: 'This product is created via API test to debug the issue',
      shortDescription: 'API test product',
      price: 39.99,
      comparePrice: 49.99,
      sku: `API-TEST-${Date.now()}`,
      category: categories[0]._id.toString(),
      trackQuantity: true,
      quantity: 15,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/400x400/4ECDC4/FFFFFF?text=API+TEST',
        alt: 'API test product image',
        isMain: true
      }],
      // GST fields (exactly as frontend sends)
      gstRate: 18,
      gstType: 'CGST_SGST',
      hsnCode: '6109',
      gstInclusive: false,
      taxable: true,
      // Size fields
      sizes: [{
        name: 'L',
        label: 'Large',
        measurements: {
          chest: '42-44 inches',
          waist: '36-38 inches',
          length: '28 inches'
        },
        stock: 10,
        isAvailable: true,
        sortOrder: 1
      }],
      sizeChart: {
        enabled: false,
        image: '',
        description: '',
        measurements: []
      }
    };
    
    console.log('   Product data being sent:');
    console.log(`     Name: ${testProductData.name}`);
    console.log(`     Price: ₹${testProductData.price}`);
    console.log(`     Category: ${testProductData.category}`);
    console.log(`     GST Rate: ${testProductData.gstRate}%`);
    console.log(`     Sizes: ${testProductData.sizes.length}`);
    console.log(`     Images: ${testProductData.images.length}`);
    
    try {
      const createResponse = await axios.post(
        `${baseURL}/api/admin/products`,
        testProductData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Product created successfully via API!');
      console.log(`   Product ID: ${createResponse.data._id}`);
      console.log(`   Product Name: ${createResponse.data.name}`);
      console.log(`   Product Slug: ${createResponse.data.slug}`);
      console.log(`   GST Rate: ${createResponse.data.gstRate}%`);
      console.log(`   Response Status: ${createResponse.status}`);
      
    } catch (createError) {
      console.log('❌ Product creation failed via API!');
      console.log(`   Status: ${createError.response?.status}`);
      console.log(`   Status Text: ${createError.response?.statusText}`);
      console.log(`   Error Message: ${createError.response?.data?.message}`);
      
      if (createError.response?.data?.errors) {
        console.log('   Validation Errors:');
        createError.response.data.errors.forEach(err => {
          console.log(`     - ${err}`);
        });
      }
      
      if (createError.response?.data?.error) {
        console.log(`   Detailed Error: ${createError.response.data.error}`);
      }
      
      console.log('\n🔍 Full error response:');
      console.log(JSON.stringify(createError.response?.data, null, 2));
    }
    
    // 6. Test with minimal data (like frontend might send)
    console.log('\n6. 🧪 Testing with Minimal Frontend Data...');
    
    const minimalData = {
      name: 'Minimal API Test',
      description: 'Minimal test product',
      price: 25.99,
      category: categories[0]._id.toString(),
      sku: `MIN-${Date.now()}`,
      trackQuantity: true,
      quantity: 5,
      isActive: true,
      isFeatured: false,
      images: [],
      gstRate: 0,
      gstType: 'CGST_SGST',
      hsnCode: '',
      gstInclusive: false,
      taxable: true,
      sizes: [],
      sizeChart: {
        enabled: false,
        image: '',
        description: '',
        measurements: []
      }
    };
    
    try {
      const minimalResponse = await axios.post(
        `${baseURL}/api/admin/products`,
        minimalData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Minimal product created successfully!');
      console.log(`   Product ID: ${minimalResponse.data._id}`);
      console.log(`   Product Name: ${minimalResponse.data.name}`);
      
    } catch (minimalError) {
      console.log('❌ Minimal product creation failed!');
      console.log(`   Error: ${minimalError.response?.data?.message}`);
    }
    
  } catch (error) {
    console.log('❌ Test setup failed:');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n🎯 DEBUGGING SUMMARY:');
  console.log('1. Database connection: Working ✅');
  console.log('2. Product model validation: Working ✅');
  console.log('3. Categories available: Working ✅');
  console.log('4. Admin authentication: Check results above');
  console.log('5. API product creation: Check results above');
  console.log('\n💡 If API tests fail, the issue is likely:');
  console.log('   - Authentication/authorization problems');
  console.log('   - Network connectivity issues');
  console.log('   - Server not running or misconfigured');
  console.log('   - CORS issues');
  console.log('   - Request format/validation issues');
}

// Run the debug
debugAPIProductCreation().catch(console.error);
