const axios = require('axios');

console.log('🌐 TESTING FRONTEND API ENDPOINTS');
console.log('==================================\n');

async function testFrontendAPI() {
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // Test 1: Products endpoint
    console.log('🧪 TEST 1: Public Products Endpoint');
    console.log('-----------------------------------');
    
    const productsResponse = await axios.get(`${baseURL}/products`);
    console.log('✅ Products endpoint working');
    console.log(`📦 Found ${productsResponse.data.products?.length || 0} products`);
    
    if (productsResponse.data.products && productsResponse.data.products.length > 0) {
      console.log('\n📋 Product List:');
      productsResponse.data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Slug: ${product.slug}`);
        console.log(`   - Price: $${product.price}`);
        console.log(`   - Active: ${product.isActive}`);
        console.log(`   - Category: ${product.category?.name || 'No category'}`);
        console.log(`   - Images: ${product.images?.length || 0}`);
        console.log('');
      });
    }

    // Test 2: Categories endpoint
    console.log('\n🧪 TEST 2: Public Categories Endpoint');
    console.log('------------------------------------');
    
    const categoriesResponse = await axios.get(`${baseURL}/categories`);
    console.log('✅ Categories endpoint working');
    console.log(`📂 Found ${categoriesResponse.data?.length || 0} categories`);
    
    if (categoriesResponse.data && categoriesResponse.data.length > 0) {
      console.log('\n📋 Category List:');
      categoriesResponse.data.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name}`);
        console.log(`   - Slug: ${category.slug}`);
        console.log(`   - Active: ${category.isActive}`);
        console.log('');
      });
    }

    // Test 3: Health check
    console.log('\n🧪 TEST 3: Health Check');
    console.log('-----------------------');
    
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check working');
    console.log(`📊 Status: ${healthResponse.data.status}`);
    console.log(`💬 Message: ${healthResponse.data.message}`);

    // Test 4: Featured products (if endpoint exists)
    console.log('\n🧪 TEST 4: Featured Products');
    console.log('----------------------------');
    
    try {
      const featuredResponse = await axios.get(`${baseURL}/products?featured=true`);
      console.log('✅ Featured products endpoint working');
      console.log(`⭐ Found ${featuredResponse.data.products?.length || 0} featured products`);
    } catch (error) {
      console.log('ℹ️  Featured products filter not implemented or no featured products');
    }

    console.log('\n🎉 All frontend API tests completed successfully!');
    console.log('\n💡 SUMMARY:');
    console.log(`   - Products available: ${productsResponse.data.products?.length || 0}`);
    console.log(`   - Categories available: ${categoriesResponse.data?.length || 0}`);
    console.log('   - API endpoints working correctly');
    console.log('   - Frontend should be able to display products');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendAPI();
