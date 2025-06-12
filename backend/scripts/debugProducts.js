const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

console.log('🔍 PRODUCT DEBUG TOOL');
console.log('=====================\n');

async function debugProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Check existing products
    console.log('\n📦 EXISTING PRODUCTS CHECK');
    console.log('---------------------------');
    
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('\n📋 Product List:');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - ID: ${product._id}`);
        console.log(`   - Slug: ${product.slug}`);
        console.log(`   - Active: ${product.isActive}`);
        console.log(`   - Category: ${product.category}`);
        console.log(`   - Price: $${product.price}`);
        console.log(`   - Created: ${product.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No products found in database');
    }

    // 2. Check categories
    console.log('\n📂 CATEGORIES CHECK');
    console.log('-------------------');
    
    const allCategories = await Category.find({});
    console.log(`Total categories in database: ${allCategories.length}`);
    
    if (allCategories.length > 0) {
      console.log('\n📋 Category List:');
      allCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name}`);
        console.log(`   - ID: ${category._id}`);
        console.log(`   - Slug: ${category.slug}`);
        console.log(`   - Active: ${category.isActive}`);
        console.log('');
      });
    } else {
      console.log('❌ No categories found in database');
      console.log('💡 Creating a test category...');
      
      const testCategory = new Category({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for debugging',
        isActive: true
      });
      
      await testCategory.save();
      console.log('✅ Test category created');
    }

    // 3. Test product creation
    console.log('\n🧪 TESTING PRODUCT CREATION');
    console.log('----------------------------');
    
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('❌ Cannot test product creation - no categories available');
      return;
    }

    const testProductData = {
      name: 'Debug Test Product',
      description: 'This is a test product created by the debug script',
      shortDescription: 'Test product for debugging',
      price: 29.99,
      sku: `TEST-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 10,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/300',
        alt: 'Test product image',
        isMain: true
      }]
    };

    console.log('🔄 Creating test product...');
    console.log('Product data:', JSON.stringify(testProductData, null, 2));

    try {
      const testProduct = new Product(testProductData);
      const savedProduct = await testProduct.save();
      console.log('✅ Test product created successfully!');
      console.log('Product ID:', savedProduct._id);
      console.log('Product slug:', savedProduct.slug);
    } catch (createError) {
      console.log('❌ Product creation failed:', createError.message);
      console.log('Full error:', createError);
    }

    // 4. Test product queries
    console.log('\n🔍 TESTING PRODUCT QUERIES');
    console.log('---------------------------');

    // Test basic query
    console.log('🔄 Testing basic product query...');
    const basicQuery = await Product.find({});
    console.log(`✅ Basic query returned ${basicQuery.length} products`);

    // Test active products query
    console.log('🔄 Testing active products query...');
    const activeQuery = await Product.find({ isActive: true });
    console.log(`✅ Active products query returned ${activeQuery.length} products`);

    // Test populated query (like frontend uses)
    console.log('🔄 Testing populated query...');
    const populatedQuery = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ createdAt: -1 })
      .limit(10);
    console.log(`✅ Populated query returned ${populatedQuery.length} products`);

    if (populatedQuery.length > 0) {
      console.log('\n📋 Sample populated product:');
      const sample = populatedQuery[0];
      console.log('Name:', sample.name);
      console.log('Slug:', sample.slug);
      console.log('Active:', sample.isActive);
      console.log('Category:', sample.category);
      console.log('Price:', sample.price);
      console.log('Images:', sample.images.length);
    }

    // 5. Test API-like query
    console.log('\n🌐 TESTING API-LIKE QUERY');
    console.log('-------------------------');
    
    const apiQuery = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ createdAt: -1 })
      .select('-reviews -description')
      .lean();
    
    console.log(`✅ API-like query returned ${apiQuery.length} products`);
    
    if (apiQuery.length > 0) {
      console.log('\n📋 API response sample:');
      console.log(JSON.stringify(apiQuery[0], null, 2));
    }

    console.log('\n🎉 Product debug completed!');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

debugProducts();
