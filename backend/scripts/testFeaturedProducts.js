const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

console.log('🌟 TESTING FEATURED PRODUCTS');
console.log('============================\n');

async function testFeaturedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Check all products
    console.log('\n📦 ALL PRODUCTS CHECK');
    console.log('---------------------');
    
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Active: ${product.isActive}`);
      console.log(`   - Featured: ${product.isFeatured}`);
      console.log(`   - Images: ${product.images?.length || 0}`);
      if (product.images && product.images.length > 0) {
        console.log(`   - Main Image URL: ${product.images[0].url}`);
      }
      console.log('');
    });

    // 2. Check featured products specifically
    console.log('\n🌟 FEATURED PRODUCTS CHECK');
    console.log('--------------------------');
    
    const featuredProducts = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-reviews -description')
      .lean();

    console.log(`Featured products found: ${featuredProducts.length}`);
    
    if (featuredProducts.length === 0) {
      console.log('❌ No featured products found!');
      console.log('💡 Let\'s make some products featured...');
      
      // Make the first 2 products featured
      const productsToFeature = await Product.find({ isActive: true }).limit(2);
      
      for (const product of productsToFeature) {
        product.isFeatured = true;
        await product.save();
        console.log(`✅ Made "${product.name}" featured`);
      }
      
      // Re-query featured products
      const newFeaturedProducts = await Product.find({ 
        isActive: true, 
        isFeatured: true 
      })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .select('-reviews -description')
        .lean();
      
      console.log(`\n🌟 Now we have ${newFeaturedProducts.length} featured products:`);
      
      newFeaturedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Slug: ${product.slug}`);
        console.log(`   - Price: $${product.price}`);
        console.log(`   - Category: ${product.category?.name || 'No category'}`);
        console.log(`   - Images: ${product.images?.length || 0}`);
        if (product.images && product.images.length > 0) {
          console.log(`   - Main Image: ${product.images[0].url}`);
          console.log(`   - Image Alt: ${product.images[0].alt || 'No alt text'}`);
        }
        console.log('');
      });
    } else {
      console.log('\n📋 Featured Products List:');
      featuredProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Slug: ${product.slug}`);
        console.log(`   - Price: $${product.price}`);
        console.log(`   - Category: ${product.category?.name || 'No category'}`);
        console.log(`   - Images: ${product.images?.length || 0}`);
        if (product.images && product.images.length > 0) {
          console.log(`   - Main Image: ${product.images[0].url}`);
          console.log(`   - Image Alt: ${product.images[0].alt || 'No alt text'}`);
        }
        console.log('');
      });
    }

    // 3. Test API response format
    console.log('\n🌐 API RESPONSE FORMAT TEST');
    console.log('---------------------------');
    
    const apiResponse = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(8)
      .select('-reviews -description')
      .lean();

    console.log('API Response Sample:');
    if (apiResponse.length > 0) {
      console.log(JSON.stringify(apiResponse[0], null, 2));
    } else {
      console.log('No featured products for API response');
    }

    console.log('\n🎉 Featured products test completed!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

testFeaturedProducts();
