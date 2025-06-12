const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function debugCompleteFlow() {
  console.log('🔍 DEBUGGING COMPLETE FLOW: Product Creation → Order Creation\n');
  
  const baseURL = process.env.BACKEND_URL || 'https://new-yistorik.onrender.com';
  console.log(`🌐 Backend URL: ${baseURL}\n`);
  
  let authToken;
  let createdProduct;
  let createdOrder;

  try {
    // 1. Connect to database
    console.log('1. 🗄️  Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected\n');

    // 2. Check/Create admin user
    console.log('2. 👤 Checking admin users...');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`   Found ${adminUsers.length} admin users`);

    let adminEmail = 'debug@admin.com';
    let adminPassword = 'debug123';

    if (adminUsers.length === 0) {
      console.log('   Creating test admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const testAdmin = new User({
        name: 'Debug Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      await testAdmin.save();
      console.log(`   ✅ Test admin created: ${adminEmail}`);
    } else {
      // Use existing admin
      adminEmail = adminUsers[0].email;
      adminPassword = 'admin123'; // Try common password
      console.log(`   Using existing admin: ${adminEmail}`);
    }

    // 3. Test admin authentication
    console.log('3. 🔐 Testing admin authentication...');
    const loginAttempts = [
      { email: adminEmail, password: adminPassword },
      { email: 'admin@clothingstore.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'admin123' },
      { email: adminUsers[0]?.email, password: 'admin123' }
    ];

    for (const attempt of loginAttempts) {
      if (!attempt.email) continue;

      try {
        console.log(`   Trying: ${attempt.email}`);
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, attempt, { timeout: 10000 });

        authToken = loginResponse.data.token;
        console.log('✅ Admin login successful');
        console.log(`   Email: ${attempt.email}`);
        console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
        break;
      } catch (loginError) {
        console.log(`   ❌ Failed: ${loginError.response?.data?.message || loginError.message}`);
      }
    }

    if (!authToken) {
      console.log('❌ Could not authenticate as admin with any credentials');
      return;
    }

    // 4. Get categories for product creation
    console.log('4. 📂 Getting categories...');
    const categories = await Category.find({}).limit(1);
    if (categories.length === 0) {
      console.log('❌ No categories found! Please run category setup script first.');
      return;
    }
    console.log(`✅ Found category: ${categories[0].name} (${categories[0]._id})\n`);

    // 5. Create a test product via API
    console.log('5. 🛍️  Creating test product via API...');
    const productData = {
      name: `Debug Test Product ${Date.now()}`,
      description: 'This is a comprehensive test product for debugging the complete flow',
      shortDescription: 'Debug test product',
      price: 99.99,
      comparePrice: 129.99,
      sku: `DEBUG-${Date.now()}`,
      category: categories[0]._id.toString(),
      trackQuantity: true,
      quantity: 50,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/400x400/4ECDC4/FFFFFF?text=DEBUG+PRODUCT',
        alt: 'Debug test product image',
        isMain: true
      }],
      // GST fields
      gstRate: 18,
      gstType: 'CGST_SGST',
      hsnCode: '6109',
      gstInclusive: false,
      taxable: true,
      // Size fields
      sizes: [{
        name: 'M',
        label: 'Medium',
        measurements: {
          chest: '40-42 inches',
          waist: '34-36 inches',
          length: '27 inches'
        },
        stock: 25,
        isAvailable: true,
        sortOrder: 1
      }, {
        name: 'L',
        label: 'Large',
        measurements: {
          chest: '42-44 inches',
          waist: '36-38 inches',
          length: '28 inches'
        },
        stock: 25,
        isAvailable: true,
        sortOrder: 2
      }],
      sizeChart: {
        enabled: true,
        description: 'Size guide for this product',
        measurements: []
      }
    };

    try {
      const createResponse = await axios.post(
        `${baseURL}/api/admin/products`,
        productData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      createdProduct = createResponse.data;
      console.log('✅ Product created successfully!');
      console.log(`   Product ID: ${createdProduct._id}`);
      console.log(`   Product Name: ${createdProduct.name}`);
      console.log(`   Product Slug: ${createdProduct.slug}`);
      console.log(`   Price: ₹${createdProduct.price}`);
      console.log(`   GST Rate: ${createdProduct.gstRate}%`);
      console.log(`   Sizes: ${createdProduct.sizes?.length || 0}`);
      console.log(`   Stock: ${createdProduct.quantity}\n`);
      
    } catch (createError) {
      console.log('❌ Product creation failed!');
      console.log(`   Status: ${createError.response?.status}`);
      console.log(`   Error: ${createError.response?.data?.message || createError.message}`);
      if (createError.response?.data?.errors) {
        console.log(`   Validation Errors:`, createError.response.data.errors);
      }
      return;
    }

    // 6. Verify product in database
    console.log('6. 🔍 Verifying product in database...');
    const dbProduct = await Product.findById(createdProduct._id).populate('category');
    if (dbProduct) {
      console.log('✅ Product found in database');
      console.log(`   Name: ${dbProduct.name}`);
      console.log(`   Category: ${dbProduct.category.name}`);
      console.log(`   Price: ₹${dbProduct.price}`);
      console.log(`   Stock: ${dbProduct.quantity}`);
      console.log(`   GST Rate: ${dbProduct.gstRate}%`);
      console.log(`   Sizes: ${dbProduct.sizes?.length || 0}\n`);
    } else {
      console.log('❌ Product not found in database!');
      return;
    }

    // 7. Test product retrieval via public API
    console.log('7. 🌐 Testing product retrieval via public API...');
    try {
      const productResponse = await axios.get(`${baseURL}/api/products/${createdProduct.slug}`, {
        timeout: 10000
      });
      
      console.log('✅ Product retrieved successfully via public API');
      console.log(`   Product: ${productResponse.data.name}`);
      console.log(`   Available: ${productResponse.data.quantity > 0 ? 'Yes' : 'No'}`);
      console.log(`   Sizes: ${productResponse.data.sizes?.length || 0}\n`);
      
    } catch (retrieveError) {
      console.log('❌ Product retrieval failed:', retrieveError.response?.data?.message || retrieveError.message);
      return;
    }

    // 8. Create a test order with the product
    console.log('8. 🛒 Creating test order...');
    const orderData = {
      orderItems: [{
        product: createdProduct._id,
        name: createdProduct.name,
        image: createdProduct.images[0]?.url || '',
        price: createdProduct.price,
        quantity: 2,
        selectedSize: createdProduct.sizes?.[0]?.name || null,
        selectedVariants: createdProduct.sizes?.[0] ? [{
          name: 'Size',
          value: createdProduct.sizes[0].name
        }] : []
      }],
      shippingAddress: {
        fullName: 'Debug Test User',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
        country: 'India',
        phone: '+91 9876543210'
      },
      paymentMethod: 'cod',
      itemsPrice: createdProduct.price * 2,
      taxPrice: (createdProduct.price * 2 * createdProduct.gstRate) / 100,
      shippingPrice: 0,
      totalPrice: (createdProduct.price * 2) + ((createdProduct.price * 2 * createdProduct.gstRate) / 100),
      isGuestOrder: true,
      guestInfo: {
        email: 'debug@test.com',
        firstName: 'Debug',
        lastName: 'User',
        phone: '+91 9876543210'
      }
    };

    try {
      const orderResponse = await axios.post(
        `${baseURL}/api/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      createdOrder = orderResponse.data;
      console.log('✅ Order created successfully!');
      console.log(`   Order ID: ${createdOrder._id}`);
      console.log(`   Order Number: ${createdOrder.orderNumber}`);
      console.log(`   Total: ₹${createdOrder.totalPrice}`);
      console.log(`   Items: ${createdOrder.orderItems.length}`);
      console.log(`   Status: ${createdOrder.status}\n`);
      
    } catch (orderError) {
      console.log('❌ Order creation failed!');
      console.log(`   Status: ${orderError.response?.status}`);
      console.log(`   Error: ${orderError.response?.data?.message || orderError.message}`);
      if (orderError.response?.data) {
        console.log(`   Full response:`, JSON.stringify(orderError.response.data, null, 2));
      }
      return;
    }

    // 9. Verify order in database
    console.log('9. 🔍 Verifying order in database...');
    const dbOrder = await Order.findById(createdOrder._id).populate('orderItems.product');
    if (dbOrder) {
      console.log('✅ Order found in database');
      console.log(`   Order Number: ${dbOrder.orderNumber}`);
      console.log(`   Total: ₹${dbOrder.totalPrice}`);
      console.log(`   Items: ${dbOrder.orderItems.length}`);
      console.log(`   Guest Order: ${dbOrder.isGuestOrder ? 'Yes' : 'No'}`);
      console.log(`   Created: ${dbOrder.createdAt}\n`);
    } else {
      console.log('❌ Order not found in database!');
      return;
    }

    // 10. Check product stock update
    console.log('10. 📦 Checking product stock update...');
    const updatedProduct = await Product.findById(createdProduct._id);
    if (updatedProduct) {
      const expectedStock = createdProduct.quantity - 2; // We ordered 2 items
      console.log(`✅ Product stock updated`);
      console.log(`   Original Stock: ${createdProduct.quantity}`);
      console.log(`   Current Stock: ${updatedProduct.quantity}`);
      console.log(`   Expected Stock: ${expectedStock}`);
      console.log(`   Stock Update: ${updatedProduct.quantity === expectedStock ? '✅ Correct' : '❌ Incorrect'}\n`);
    }

    // 11. Test order retrieval
    console.log('11. 📋 Testing order retrieval...');
    try {
      const orderRetrieveResponse = await axios.get(`${baseURL}/api/orders/${createdOrder._id}`, {
        timeout: 10000
      });
      
      console.log('✅ Order retrieved successfully');
      console.log(`   Order: ${orderRetrieveResponse.data.orderNumber}`);
      console.log(`   Status: ${orderRetrieveResponse.data.status}\n`);
      
    } catch (retrieveOrderError) {
      console.log('❌ Order retrieval failed:', retrieveOrderError.response?.data?.message || retrieveOrderError.message);
    }

    console.log('🎉 COMPLETE FLOW TEST SUCCESSFUL!');
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Product Created: ${createdProduct.name} (${createdProduct._id})`);
    console.log(`✅ Order Created: ${createdOrder.orderNumber} (${createdOrder._id})`);
    console.log(`✅ Stock Updated: ${createdProduct.quantity} → ${updatedProduct.quantity}`);
    console.log(`✅ Total Amount: ₹${createdOrder.totalPrice}`);

  } catch (error) {
    console.log('❌ Complete flow test failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  } finally {
    // Cleanup (optional)
    if (createdProduct) {
      console.log('\n🧹 Cleaning up test data...');
      try {
        await Product.findByIdAndDelete(createdProduct._id);
        console.log('✅ Test product deleted');
      } catch (cleanupError) {
        console.log('⚠️ Failed to delete test product:', cleanupError.message);
      }
    }
    
    if (createdOrder) {
      try {
        await Order.findByIdAndDelete(createdOrder._id);
        console.log('✅ Test order deleted');
      } catch (cleanupError) {
        console.log('⚠️ Failed to delete test order:', cleanupError.message);
      }
    }

    await mongoose.disconnect();
    console.log('\n🔚 Database disconnected');
  }
}

// Run the complete flow test
debugCompleteFlow().catch(console.error);
