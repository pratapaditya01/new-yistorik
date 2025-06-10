const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

/**
 * Test script to create and verify 0% GST products
 */
async function testZeroGST() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test category
    let category = await Category.findOne({ name: 'Test Category' });
    if (!category) {
      category = new Category({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for GST testing'
      });
      await category.save();
      console.log('✅ Created test category');
    }

    // Test products with different GST scenarios
    const testProducts = [
      {
        name: 'Zero GST Test Book',
        description: 'Educational book with 0% GST',
        shortDescription: 'Educational book',
        price: 299,
        sku: `ZERO-GST-BOOK-${Date.now()}`,
        gstRate: 0,
        gstType: 'EXEMPT',
        hsnCode: '4901',
        taxable: false
      },
      {
        name: 'Zero GST Test Medicine',
        description: 'Essential medicine with 0% GST',
        shortDescription: 'Essential medicine',
        price: 150,
        sku: `ZERO-GST-MED-${Date.now()}`,
        gstRate: 0,
        gstType: 'ZERO_RATED',
        hsnCode: '3004',
        taxable: false
      },
      {
        name: 'Regular GST Test Product',
        description: 'Regular product with 18% GST',
        shortDescription: 'Regular product',
        price: 500,
        sku: `REG-GST-PROD-${Date.now()}`,
        gstRate: 18,
        gstType: 'CGST_SGST',
        hsnCode: '8517',
        taxable: true
      }
    ];

    console.log('\n🧪 Creating test products...\n');

    for (const productData of testProducts) {
      try {
        const product = new Product({
          ...productData,
          category: category._id,
          trackQuantity: true,
          quantity: 10,
          isActive: true,
          images: [{
            url: '/uploads/test-product.jpg',
            alt: productData.name,
            isMain: true
          }]
        });

        const savedProduct = await product.save();
        
        console.log(`✅ ${savedProduct.name}`);
        console.log(`   GST Rate: ${savedProduct.gstRate}%`);
        console.log(`   GST Type: ${savedProduct.gstType}`);
        console.log(`   Taxable: ${savedProduct.taxable}`);
        console.log(`   HSN Code: ${savedProduct.hsnCode}`);
        console.log(`   Product ID: ${savedProduct._id}`);
        console.log(`   Slug: ${savedProduct.slug}\n`);

      } catch (error) {
        console.log(`❌ Failed to create ${productData.name}:`, error.message);
      }
    }

    // Verify products in database
    console.log('🔍 Verifying products in database...\n');
    
    const zeroGSTProducts = await Product.find({ gstRate: 0 });
    console.log(`Found ${zeroGSTProducts.length} products with 0% GST:`);
    
    zeroGSTProducts.forEach(product => {
      console.log(`- ${product.name}: GST ${product.gstRate}%, Type: ${product.gstType}`);
    });

    const regularGSTProducts = await Product.find({ gstRate: { $gt: 0 } });
    console.log(`\nFound ${regularGSTProducts.length} products with GST > 0%:`);
    
    regularGSTProducts.slice(0, 5).forEach(product => {
      console.log(`- ${product.name}: GST ${product.gstRate}%, Type: ${product.gstType}`);
    });

    console.log('\n✅ Test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check admin panel - products should show correct GST rates');
    console.log('2. Check product pages - 0% GST products should show "GST Exempt"');
    console.log('3. Check cart/checkout - 0% GST products should not add tax');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testZeroGST();
}

module.exports = testZeroGST;
