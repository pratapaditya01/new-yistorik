const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

console.log('🧪 TESTING FIXED PRODUCT CREATION');
console.log('==================================\n');

async function testProductCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // Get a category
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('❌ No categories found');
      return;
    }

    console.log(`📂 Using category: ${categories[0].name} (${categories[0]._id})`);

    // Test 1: Create product with proper name
    console.log('\n🧪 TEST 1: Creating product with proper name');
    const testProduct1 = {
      name: 'Test Product with Proper Name',
      description: 'This is a detailed description of the test product with proper validation.',
      shortDescription: 'Test product for debugging',
      price: 49.99,
      sku: `TEST-PROPER-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 15,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/400',
        alt: 'Test product image',
        isMain: true
      }]
    };

    try {
      const product1 = new Product(testProduct1);
      const saved1 = await product1.save();
      console.log('✅ Product 1 created successfully!');
      console.log(`   Name: ${saved1.name}`);
      console.log(`   Slug: ${saved1.slug}`);
      console.log(`   ID: ${saved1._id}`);
    } catch (error) {
      console.log('❌ Product 1 creation failed:', error.message);
    }

    // Test 2: Create product with short name
    console.log('\n🧪 TEST 2: Creating product with short name');
    const testProduct2 = {
      name: 'H',
      description: 'This is a product with a very short name to test slug generation.',
      shortDescription: 'Short name test',
      price: 25.00,
      sku: `TEST-SHORT-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 5,
      isActive: true,
      isFeatured: false,
      images: [{
        url: 'https://placehold.co/300',
        alt: 'Short name test image',
        isMain: true
      }]
    };

    try {
      const product2 = new Product(testProduct2);
      const saved2 = await product2.save();
      console.log('✅ Product 2 created successfully!');
      console.log(`   Name: ${saved2.name}`);
      console.log(`   Slug: ${saved2.slug}`);
      console.log(`   ID: ${saved2._id}`);
    } catch (error) {
      console.log('❌ Product 2 creation failed:', error.message);
    }

    // Test 3: Create product with special characters
    console.log('\n🧪 TEST 3: Creating product with special characters');
    const testProduct3 = {
      name: 'Special Product! @#$%^&*()',
      description: 'This product has special characters in the name to test slug generation.',
      shortDescription: 'Special characters test',
      price: 75.50,
      sku: `TEST-SPECIAL-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 8,
      isActive: true,
      isFeatured: true,
      images: [{
        url: 'https://placehold.co/350',
        alt: 'Special characters test image',
        isMain: true
      }]
    };

    try {
      const product3 = new Product(testProduct3);
      const saved3 = await product3.save();
      console.log('✅ Product 3 created successfully!');
      console.log(`   Name: ${saved3.name}`);
      console.log(`   Slug: ${saved3.slug}`);
      console.log(`   ID: ${saved3._id}`);
    } catch (error) {
      console.log('❌ Product 3 creation failed:', error.message);
    }

    // Test 4: Query all products
    console.log('\n📋 FINAL PRODUCT LIST');
    console.log('---------------------');
    const allProducts = await Product.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    console.log(`Total products: ${allProducts.length}`);
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Category: ${product.category?.name || 'No category'}`);
      console.log(`   Active: ${product.isActive}`);
      console.log(`   Price: $${product.price}`);
      console.log('');
    });

    console.log('🎉 Product creation tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

testProductCreation();
