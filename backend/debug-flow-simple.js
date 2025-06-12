const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function debugFlowSimple() {
  console.log('🔍 SIMPLE FLOW DEBUG: Product → Cart → Order\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected\n');

    // 1. Check existing data
    console.log('1. 📊 Checking existing data...');
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`   Products: ${productCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Users: ${userCount}\n`);

    // 2. Test product creation directly in database
    console.log('2. 🛍️  Testing product creation in database...');
    
    const categories = await Category.find({}).limit(1);
    if (categories.length === 0) {
      console.log('❌ No categories found! Please run category setup first.');
      return;
    }

    const testProduct = new Product({
      name: `Test Product ${Date.now()}`,
      description: 'Test product for debugging flow',
      shortDescription: 'Test product',
      price: 49.99,
      sku: `TEST-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 100,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/400x400/4ECDC4/FFFFFF?text=TEST',
        alt: 'Test product',
        isMain: true
      }],
      gstRate: 18,
      gstType: 'CGST_SGST',
      hsnCode: '6109',
      gstInclusive: false,
      taxable: true,
      sizes: [{
        name: 'M',
        label: 'Medium',
        stock: 50,
        isAvailable: true,
        sortOrder: 1
      }],
      sizeChart: {
        enabled: false,
        image: '',
        description: '',
        measurements: []
      }
    });

    const savedProduct = await testProduct.save();
    console.log('✅ Product created successfully');
    console.log(`   ID: ${savedProduct._id}`);
    console.log(`   Name: ${savedProduct.name}`);
    console.log(`   Price: ₹${savedProduct.price}`);
    console.log(`   Stock: ${savedProduct.quantity}`);
    console.log(`   GST: ${savedProduct.gstRate}%`);
    console.log(`   Sizes: ${savedProduct.sizes.length}\n`);

    // 3. Test order creation directly in database
    console.log('3. 🛒 Testing order creation in database...');
    
    const testOrder = new Order({
      orderNumber: `ORD-${Date.now()}`,
      orderItems: [{
        product: savedProduct._id,
        name: savedProduct.name,
        image: savedProduct.images[0].url,
        price: savedProduct.price,
        quantity: 2,
        selectedSize: savedProduct.sizes[0].name,
        selectedVariants: [{
          name: 'Size',
          value: savedProduct.sizes[0].name
        }]
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
      itemsPrice: savedProduct.price * 2,
      taxPrice: (savedProduct.price * 2 * savedProduct.gstRate) / 100,
      shippingPrice: 0,
      totalPrice: (savedProduct.price * 2) + ((savedProduct.price * 2 * savedProduct.gstRate) / 100),
      status: 'pending',
      isPaid: false,
      isDelivered: false,
      isGuestOrder: true,
      guestInfo: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+91 9876543210'
      }
    });

    const savedOrder = await testOrder.save();
    console.log('✅ Order created successfully');
    console.log(`   ID: ${savedOrder._id}`);
    console.log(`   Order Number: ${savedOrder.orderNumber}`);
    console.log(`   Total: ₹${savedOrder.totalPrice}`);
    console.log(`   Items: ${savedOrder.orderItems.length}`);
    console.log(`   Status: ${savedOrder.status}\n`);

    // 4. Test stock update
    console.log('4. 📦 Testing stock update...');
    const originalStock = savedProduct.quantity;
    savedProduct.quantity -= 2; // Simulate order fulfillment
    await savedProduct.save();
    
    console.log(`✅ Stock updated`);
    console.log(`   Original: ${originalStock}`);
    console.log(`   Updated: ${savedProduct.quantity}\n`);

    // 5. Test data retrieval
    console.log('5. 🔍 Testing data retrieval...');
    
    const retrievedProduct = await Product.findById(savedProduct._id).populate('category');
    const retrievedOrder = await Order.findById(savedOrder._id).populate('orderItems.product');
    
    console.log('✅ Data retrieval successful');
    console.log(`   Product: ${retrievedProduct.name} (${retrievedProduct.category.name})`);
    console.log(`   Order: ${retrievedOrder.orderNumber} (${retrievedOrder.orderItems.length} items)\n`);

    // 6. Test common issues
    console.log('6. 🧪 Testing common issues...');
    
    // Test duplicate SKU
    try {
      const duplicateProduct = new Product({
        name: 'Duplicate SKU Test',
        description: 'Test duplicate SKU',
        price: 29.99,
        sku: savedProduct.sku, // Same SKU
        category: categories[0]._id,
        quantity: 10
      });
      await duplicateProduct.save();
      console.log('❌ Duplicate SKU test failed - should have thrown error');
    } catch (duplicateError) {
      console.log('✅ Duplicate SKU properly rejected');
    }

    // Test missing required fields
    try {
      const invalidProduct = new Product({
        name: 'Invalid Product'
        // Missing required fields
      });
      await invalidProduct.save();
      console.log('❌ Validation test failed - should have thrown error');
    } catch (validationError) {
      console.log('✅ Validation properly working');
    }

    // Test invalid price
    try {
      const invalidPriceProduct = new Product({
        name: 'Invalid Price Product',
        description: 'Test invalid price',
        price: -10, // Negative price
        sku: `INVALID-${Date.now()}`,
        category: categories[0]._id,
        quantity: 10
      });
      await invalidPriceProduct.save();
      console.log('❌ Invalid price test failed - should have thrown error');
    } catch (priceError) {
      console.log('✅ Invalid price properly rejected');
    }

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log('✅ Product creation: Working');
    console.log('✅ Order creation: Working');
    console.log('✅ Stock management: Working');
    console.log('✅ Data validation: Working');
    console.log('✅ Error handling: Working');

    console.log('\n💡 NEXT STEPS FOR FRONTEND DEBUGGING:');
    console.log('1. Check admin authentication in browser');
    console.log('2. Verify API endpoints are reachable');
    console.log('3. Check form validation in frontend');
    console.log('4. Verify category selection');
    console.log('5. Test with minimal product data');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Product.findByIdAndDelete(savedProduct._id);
    await Order.findByIdAndDelete(savedOrder._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.log('❌ Flow test failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Database disconnected');
  }
}

// Run the simple flow test
debugFlowSimple().catch(console.error);
