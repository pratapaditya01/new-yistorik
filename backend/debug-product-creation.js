const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

async function debugProductCreation() {
  console.log('🔍 DEBUGGING PRODUCT CREATION FAILURE\n');
  
  try {
    // 1. Test database connection
    console.log('1. 🗄️  Testing Database Connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Database connected successfully\n');
    
    // 2. Check if categories exist
    console.log('2. 📂 Checking Categories...');
    const categories = await Category.find({});
    console.log(`   Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.log('❌ No categories found! Creating a test category...');
      const testCategory = new Category({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for debugging'
      });
      const savedCategory = await testCategory.save();
      console.log(`✅ Created test category: ${savedCategory.name} (${savedCategory._id})`);
      categories.push(savedCategory);
    } else {
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat._id})`);
      });
    }
    console.log('');
    
    // 3. Test minimal product creation
    console.log('3. 🧪 Testing Minimal Product Creation...');
    const minimalProductData = {
      name: 'Debug Test Product',
      description: 'This is a test product for debugging',
      price: 29.99,
      sku: `DEBUG-${Date.now()}`,
      category: categories[0]._id,
    };
    
    console.log('   Product data:', JSON.stringify(minimalProductData, null, 2));
    
    try {
      const minimalProduct = new Product(minimalProductData);
      const savedMinimal = await minimalProduct.save();
      console.log('✅ Minimal product created successfully!');
      console.log(`   ID: ${savedMinimal._id}`);
      console.log(`   Slug: ${savedMinimal.slug}`);
      console.log('');
    } catch (minimalError) {
      console.log('❌ Minimal product creation failed:');
      console.log(`   Error: ${minimalError.message}`);
      if (minimalError.errors) {
        console.log('   Validation errors:');
        Object.keys(minimalError.errors).forEach(field => {
          console.log(`     - ${field}: ${minimalError.errors[field].message}`);
        });
      }
      console.log('');
    }
    
    // 4. Test full product creation (like from admin form)
    console.log('4. 🧪 Testing Full Product Creation (Admin Form Style)...');
    const fullProductData = {
      name: 'Full Debug Test Product',
      description: 'This is a comprehensive test product with all fields',
      shortDescription: 'Full test product',
      price: 49.99,
      comparePrice: 59.99,
      sku: `FULL-DEBUG-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 10,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/400x400/FF6B6B/FFFFFF?text=TEST',
        alt: 'Test product image',
        isMain: true
      }],
      // GST fields
      gstRate: 18,
      gstType: 'CGST_SGST',
      hsnCode: '1234',
      gstInclusive: false,
      taxable: true,
      // Size fields
      sizes: [{
        name: 'M',
        label: 'Medium',
        stock: 5,
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
    
    console.log('   Full product data keys:', Object.keys(fullProductData));
    
    try {
      const fullProduct = new Product(fullProductData);
      const savedFull = await fullProduct.save();
      console.log('✅ Full product created successfully!');
      console.log(`   ID: ${savedFull._id}`);
      console.log(`   Name: ${savedFull.name}`);
      console.log(`   Slug: ${savedFull.slug}`);
      console.log(`   GST Rate: ${savedFull.gstRate}%`);
      console.log(`   Sizes: ${savedFull.sizes.length}`);
      console.log('');
    } catch (fullError) {
      console.log('❌ Full product creation failed:');
      console.log(`   Error: ${fullError.message}`);
      console.log(`   Error name: ${fullError.name}`);
      console.log(`   Error code: ${fullError.code}`);
      
      if (fullError.errors) {
        console.log('   Validation errors:');
        Object.keys(fullError.errors).forEach(field => {
          console.log(`     - ${field}: ${fullError.errors[field].message}`);
        });
      }
      
      if (fullError.keyPattern) {
        console.log('   Duplicate key error:');
        console.log(`     Field: ${Object.keys(fullError.keyPattern)[0]}`);
      }
      console.log('');
    }
    
    // 5. Test product creation with empty/null values
    console.log('5. 🧪 Testing Product Creation with Edge Cases...');
    const edgeCaseData = {
      name: 'Edge Case Test Product',
      description: 'Testing edge cases',
      price: 19.99,
      sku: `EDGE-${Date.now()}`,
      category: categories[0]._id,
      gstRate: 0, // Test 0% GST
      sizes: [], // Empty sizes array
      images: [] // Empty images array
    };
    
    try {
      const edgeProduct = new Product(edgeCaseData);
      const savedEdge = await edgeProduct.save();
      console.log('✅ Edge case product created successfully!');
      console.log(`   ID: ${savedEdge._id}`);
      console.log(`   GST Rate: ${savedEdge.gstRate}%`);
      console.log('');
    } catch (edgeError) {
      console.log('❌ Edge case product creation failed:');
      console.log(`   Error: ${edgeError.message}`);
      console.log('');
    }
    
    // 6. List all products
    console.log('6. 📋 Current Products in Database...');
    const allProducts = await Product.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`   Total products: ${allProducts.length}`);
    allProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.sku})`);
      console.log(`      Category: ${product.category?.name || 'No category'}`);
      console.log(`      Price: ₹${product.price}`);
      console.log(`      GST: ${product.gstRate}%`);
      console.log(`      Created: ${product.createdAt}`);
    });
    
  } catch (error) {
    console.log('❌ Database connection or setup failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Database disconnected');
  }
}

// Run the debug
debugProductCreation().catch(console.error);
