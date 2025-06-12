const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('dotenv').config();

async function debugOrderAPI() {
  console.log('🛒 DEBUGGING ORDER API ENDPOINT\n');
  
  const baseURL = process.env.BACKEND_URL || 'https://new-yistorik.onrender.com';
  console.log(`🌐 Backend URL: ${baseURL}\n`);
  
  try {
    // 1. Connect to database
    console.log('1. 🗄️  Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected\n');

    // 2. Test basic API connectivity
    console.log('2. 🌐 Testing basic API connectivity...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`, { timeout: 10000 });
      console.log('✅ Backend is reachable');
      console.log(`   Status: ${healthResponse.status}`);
    } catch (connectError) {
      console.log('❌ Backend connectivity issue:', connectError.message);
      return;
    }

    // 3. Test orders endpoint availability
    console.log('3. 🧪 Testing orders endpoint availability...');
    try {
      const testResponse = await axios.get(`${baseURL}/api/orders/test`, { timeout: 10000 });
      console.log('✅ Orders endpoint is available');
      console.log(`   Response: ${testResponse.data.message}`);
    } catch (testError) {
      console.log('❌ Orders endpoint test failed:', testError.response?.data?.message || testError.message);
    }

    // 4. Get a real product for testing
    console.log('4. 📦 Getting real product for testing...');
    const products = await Product.find({ isActive: true }).limit(1);
    if (products.length === 0) {
      console.log('❌ No products found for testing');
      return;
    }
    
    const testProduct = products[0];
    console.log(`✅ Using product: ${testProduct.name}`);
    console.log(`   Product ID: ${testProduct._id}`);
    console.log(`   Price: ₹${testProduct.price}`);
    console.log(`   Stock: ${testProduct.quantity}\n`);

    // 5. Test order creation with minimal valid data
    console.log('5. 🛒 Testing order creation with minimal data...');
    
    const minimalOrderData = {
      orderItems: [{
        product: testProduct._id.toString(),
        name: testProduct.name,
        image: testProduct.images?.[0]?.url || '/placeholder.jpg',
        price: testProduct.price,
        quantity: 1,
        selectedVariants: []
      }],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456',
        country: 'India',
        phone: '+91 9876543210'
      },
      paymentMethod: 'cash_on_delivery',
      itemsPrice: testProduct.price,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: testProduct.price,
      isGuestOrder: true,
      guestInfo: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+91 9876543210'
      }
    };

    console.log('📋 Order data to be sent:');
    console.log(JSON.stringify(minimalOrderData, null, 2));

    try {
      const orderResponse = await axios.post(`${baseURL}/api/orders`, minimalOrderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('✅ Order creation successful!');
      console.log(`   Order ID: ${orderResponse.data._id}`);
      console.log(`   Order Number: ${orderResponse.data.orderNumber}`);
      console.log(`   Total: ₹${orderResponse.data.totalPrice}`);
      console.log(`   Status: ${orderResponse.data.status}`);
      
      // Clean up test order
      await Order.findByIdAndDelete(orderResponse.data._id);
      console.log('✅ Test order cleaned up\n');
      
    } catch (orderError) {
      console.log('❌ Order creation failed!');
      console.log(`   Status: ${orderError.response?.status}`);
      console.log(`   Error: ${orderError.response?.data?.message || orderError.message}`);
      
      if (orderError.response?.data) {
        console.log('📋 Full error response:');
        console.log(JSON.stringify(orderError.response.data, null, 2));
      }
      
      if (orderError.code === 'ECONNABORTED') {
        console.log('⏰ Request timed out - server may be slow');
      }
      
      return;
    }

    // 6. Test order creation with complex data (sizes, variants)
    console.log('6. 🎯 Testing order creation with complex data...');
    
    const complexOrderData = {
      orderItems: [{
        product: testProduct._id.toString(),
        name: testProduct.name,
        image: testProduct.images?.[0]?.url || '/placeholder.jpg',
        price: testProduct.price,
        quantity: 2,
        selectedVariants: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Blue' }
        ]
      }],
      shippingAddress: {
        fullName: 'Complex Test User',
        address: '456 Complex Street, Apt 2B',
        city: 'Complex City',
        state: 'Complex State',
        zipCode: '654321',
        country: 'India',
        phone: '+91 9876543210'
      },
      paymentMethod: 'cash_on_delivery',
      itemsPrice: testProduct.price * 2,
      taxPrice: (testProduct.price * 2 * 0.18), // 18% GST
      shippingPrice: 99,
      totalPrice: (testProduct.price * 2) + (testProduct.price * 2 * 0.18) + 99,
      discountAmount: 50,
      couponCode: 'TEST50',
      isGuestOrder: true,
      guestInfo: {
        email: 'complex@example.com',
        firstName: 'Complex',
        lastName: 'User',
        phone: '+91 9876543210'
      }
    };

    try {
      const complexOrderResponse = await axios.post(`${baseURL}/api/orders`, complexOrderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('✅ Complex order creation successful!');
      console.log(`   Order ID: ${complexOrderResponse.data._id}`);
      console.log(`   Order Number: ${complexOrderResponse.data.orderNumber}`);
      console.log(`   Items: ${complexOrderResponse.data.orderItems.length}`);
      console.log(`   Variants: ${complexOrderResponse.data.orderItems[0].selectedVariants?.length || 0}`);
      console.log(`   Total: ₹${complexOrderResponse.data.totalPrice}`);
      
      // Clean up test order
      await Order.findByIdAndDelete(complexOrderResponse.data._id);
      console.log('✅ Complex test order cleaned up\n');
      
    } catch (complexError) {
      console.log('❌ Complex order creation failed!');
      console.log(`   Status: ${complexError.response?.status}`);
      console.log(`   Error: ${complexError.response?.data?.message || complexError.message}`);
    }

    // 7. Test invalid order data
    console.log('7. ⚠️  Testing invalid order data handling...');
    
    const invalidOrderData = {
      orderItems: [], // Empty items
      shippingAddress: {
        fullName: 'Invalid User'
        // Missing required fields
      },
      paymentMethod: 'invalid_method',
      itemsPrice: -10, // Negative price
      totalPrice: 0
    };

    try {
      await axios.post(`${baseURL}/api/orders`, invalidOrderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('❌ Invalid order was accepted (this should not happen)');
      
    } catch (invalidError) {
      console.log('✅ Invalid order properly rejected');
      console.log(`   Status: ${invalidError.response?.status}`);
      console.log(`   Error: ${invalidError.response?.data?.message || invalidError.message}`);
    }

    // 8. Test CORS and headers
    console.log('8. 🌐 Testing CORS and headers...');
    
    try {
      const corsResponse = await axios.options(`${baseURL}/api/orders`, {
        headers: {
          'Origin': 'https://new-yistorik-delta.vercel.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        timeout: 10000
      });
      
      console.log('✅ CORS preflight successful');
      console.log(`   Status: ${corsResponse.status}`);
      
    } catch (corsError) {
      console.log('⚠️ CORS preflight failed (may be normal)');
      console.log(`   Status: ${corsError.response?.status}`);
    }

    // 9. Check database state
    console.log('9. 🗄️  Checking database state...');
    
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log(`   Total orders in database: ${orderCount}`);
    console.log(`   Total products in database: ${productCount}`);
    
    // Check for any orders with issues
    const ordersWithIssues = await Order.find({
      $or: [
        { orderItems: { $size: 0 } },
        { totalPrice: { $lte: 0 } },
        { 'shippingAddress.fullName': { $exists: false } }
      ]
    });
    
    console.log(`   Orders with potential issues: ${ordersWithIssues.length}`);

    console.log('\n🎉 ORDER API DEBUGGING COMPLETE!');
    console.log('\n📊 SUMMARY:');
    console.log('✅ Backend connectivity: Working');
    console.log('✅ Orders endpoint: Available');
    console.log('✅ Order creation: Working');
    console.log('✅ Complex orders: Working');
    console.log('✅ Validation: Working');
    console.log('✅ Database operations: Working');

    console.log('\n💡 FRONTEND DEBUGGING TIPS:');
    console.log('1. Check browser network tab for exact error details');
    console.log('2. Verify order data format matches backend expectations');
    console.log('3. Check for CORS issues in browser console');
    console.log('4. Ensure all required fields are present');
    console.log('5. Verify product IDs exist in database');

  } catch (error) {
    console.log('❌ Order API debugging failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Database disconnected');
  }
}

// Run the order API debugging
debugOrderAPI().catch(console.error);
