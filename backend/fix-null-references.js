const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

async function fixNullReferences() {
  console.log('🔧 FIXING NULL REFERENCE ISSUES\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected\n');

    // 1. Find products with null or invalid category references
    console.log('1. 🔍 Finding products with null category references...');
    
    const productsWithNullCategory = await Product.find({
      $or: [
        { category: null },
        { category: { $exists: false } }
      ]
    });
    
    console.log(`   Found ${productsWithNullCategory.length} products with null categories`);
    
    // 2. Find products with invalid category references (category doesn't exist)
    console.log('2. 🔍 Finding products with invalid category references...');
    
    const allProducts = await Product.find({});
    const invalidCategoryProducts = [];
    
    for (const product of allProducts) {
      if (product.category) {
        try {
          const categoryExists = await Category.findById(product.category);
          if (!categoryExists) {
            invalidCategoryProducts.push(product);
          }
        } catch (error) {
          // Invalid ObjectId format
          invalidCategoryProducts.push(product);
        }
      }
    }
    
    console.log(`   Found ${invalidCategoryProducts.length} products with invalid category references`);
    
    // 3. Get or create a default category
    console.log('3. 📂 Setting up default category...');
    
    let defaultCategory = await Category.findOne({ slug: 'uncategorized' });
    
    if (!defaultCategory) {
      defaultCategory = new Category({
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Products without a specific category',
        isActive: true,
        sortOrder: 999
      });
      await defaultCategory.save();
      console.log('   ✅ Created default "Uncategorized" category');
    } else {
      console.log('   ✅ Using existing "Uncategorized" category');
    }
    
    // 4. Fix products with null categories
    console.log('4. 🔧 Fixing products with null categories...');
    
    let fixedNullCount = 0;
    for (const product of productsWithNullCategory) {
      product.category = defaultCategory._id;
      await product.save();
      fixedNullCount++;
    }
    
    console.log(`   ✅ Fixed ${fixedNullCount} products with null categories`);
    
    // 5. Fix products with invalid category references
    console.log('5. 🔧 Fixing products with invalid category references...');
    
    let fixedInvalidCount = 0;
    for (const product of invalidCategoryProducts) {
      product.category = defaultCategory._id;
      await product.save();
      fixedInvalidCount++;
    }
    
    console.log(`   ✅ Fixed ${fixedInvalidCount} products with invalid category references`);
    
    // 6. Verify all products now have valid categories
    console.log('6. ✅ Verifying fixes...');
    
    const remainingIssues = await Product.find({
      $or: [
        { category: null },
        { category: { $exists: false } }
      ]
    });
    
    console.log(`   Remaining products with null categories: ${remainingIssues.length}`);
    
    // 7. Test product population
    console.log('7. 🧪 Testing product population...');
    
    const testProducts = await Product.find({})
      .populate('category', 'name slug')
      .limit(5);
    
    console.log('   Sample products with populated categories:');
    testProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} → ${product.category?.name || 'NO CATEGORY'}`);
    });
    
    // 8. Clean up any orphaned data
    console.log('8. 🧹 Cleaning up orphaned data...');
    
    // Remove any products with empty names
    const emptyNameProducts = await Product.find({
      $or: [
        { name: null },
        { name: '' },
        { name: { $exists: false } }
      ]
    });
    
    if (emptyNameProducts.length > 0) {
      console.log(`   Found ${emptyNameProducts.length} products with empty names`);
      for (const product of emptyNameProducts) {
        if (!product.name || product.name.trim() === '') {
          product.name = `Product ${product._id}`;
          await product.save();
          console.log(`   ✅ Fixed empty name for product ${product._id}`);
        }
      }
    }
    
    // 9. Generate summary report
    console.log('\n📊 SUMMARY REPORT:');
    console.log(`✅ Products with null categories fixed: ${fixedNullCount}`);
    console.log(`✅ Products with invalid categories fixed: ${fixedInvalidCount}`);
    console.log(`✅ Default category created/used: ${defaultCategory.name}`);
    console.log(`✅ Remaining issues: ${remainingIssues.length}`);
    
    const totalProducts = await Product.countDocuments();
    const productsWithCategories = await Product.countDocuments({
      category: { $exists: true, $ne: null }
    });
    
    console.log(`📈 Total products: ${totalProducts}`);
    console.log(`📈 Products with categories: ${productsWithCategories}`);
    console.log(`📈 Success rate: ${((productsWithCategories / totalProducts) * 100).toFixed(2)}%`);
    
    // 10. Test admin API response
    console.log('\n10. 🧪 Testing admin API response format...');
    
    const adminProducts = await Product.find({})
      .populate('category', 'name slug')
      .limit(3);
    
    console.log('   Admin API test response:');
    adminProducts.forEach((product, index) => {
      const response = {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity
      };
      console.log(`   ${index + 1}.`, JSON.stringify(response, null, 2));
    });
    
    console.log('\n🎉 NULL REFERENCE FIXES COMPLETED!');
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Clear browser cache and refresh admin page');
    console.log('2. Check frontend null safety implementations');
    console.log('3. Monitor for any remaining null reference errors');
    console.log('4. Consider adding validation to prevent future null references');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Database disconnected');
  }
}

// Additional utility functions
async function validateDataIntegrity() {
  console.log('🔍 VALIDATING DATA INTEGRITY...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check for products without required fields
    const issues = [];
    
    const productsWithoutName = await Product.countDocuments({
      $or: [{ name: null }, { name: '' }, { name: { $exists: false } }]
    });
    if (productsWithoutName > 0) {
      issues.push(`${productsWithoutName} products without names`);
    }
    
    const productsWithoutCategory = await Product.countDocuments({
      $or: [{ category: null }, { category: { $exists: false } }]
    });
    if (productsWithoutCategory > 0) {
      issues.push(`${productsWithoutCategory} products without categories`);
    }
    
    const productsWithoutPrice = await Product.countDocuments({
      $or: [{ price: null }, { price: { $exists: false } }]
    });
    if (productsWithoutPrice > 0) {
      issues.push(`${productsWithoutPrice} products without prices`);
    }
    
    if (issues.length === 0) {
      console.log('✅ Data integrity check passed!');
    } else {
      console.log('⚠️ Data integrity issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    await mongoose.disconnect();
    return issues;
    
  } catch (error) {
    console.error('❌ Data integrity check failed:', error);
    return ['Data integrity check failed'];
  }
}

// Export functions for use in other scripts
module.exports = {
  fixNullReferences,
  validateDataIntegrity
};

// Run if called directly
if (require.main === module) {
  fixNullReferences().catch(console.error);
}
