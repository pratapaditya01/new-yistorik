const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

/**
 * Create test products with sizes for debugging the complete size flow
 */
async function createSizeTestProducts() {
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
        description: 'Test category for size testing'
      });
      await category.save();
      console.log('✅ Created test category');
    }

    // Test products with different size scenarios
    const testProducts = [
      {
        name: 'Size Test T-Shirt - Complete Flow',
        description: 'T-shirt with multiple sizes for testing complete size flow from admin to checkout',
        shortDescription: 'Size test t-shirt',
        price: 999,
        sku: `SIZE-TEST-TSHIRT-${Date.now()}`,
        gstRate: 18,
        gstType: 'CGST_SGST',
        hsnCode: '6109',
        sizes: [
          {
            name: 'XS',
            label: 'Extra Small',
            stock: 5,
            isAvailable: true,
            measurements: {
              chest: '32-34',
              length: '24',
              sleeve: '7',
              shoulder: '16'
            },
            sortOrder: 1
          },
          {
            name: 'S',
            label: 'Small',
            stock: 10,
            isAvailable: true,
            measurements: {
              chest: '36-38',
              length: '26',
              sleeve: '8',
              shoulder: '17'
            },
            sortOrder: 2
          },
          {
            name: 'M',
            label: 'Medium',
            stock: 15,
            isAvailable: true,
            measurements: {
              chest: '38-40',
              length: '27',
              sleeve: '8.5',
              shoulder: '18'
            },
            sortOrder: 3
          },
          {
            name: 'L',
            label: 'Large',
            stock: 8,
            isAvailable: true,
            measurements: {
              chest: '40-42',
              length: '28',
              sleeve: '9',
              shoulder: '19'
            },
            sortOrder: 4
          },
          {
            name: 'XL',
            label: 'Extra Large',
            stock: 0,
            isAvailable: false, // Out of stock
            measurements: {
              chest: '42-44',
              length: '29',
              sleeve: '9.5',
              shoulder: '20'
            },
            sortOrder: 5
          }
        ],
        sizeChart: {
          enabled: true,
          description: 'Size guide for our t-shirts. Measurements are in inches.',
          measurements: [
            { size: 'XS', chest: '32-34', length: '24', sleeve: '7', shoulder: '16' },
            { size: 'S', chest: '36-38', length: '26', sleeve: '8', shoulder: '17' },
            { size: 'M', chest: '38-40', length: '27', sleeve: '8.5', shoulder: '18' },
            { size: 'L', chest: '40-42', length: '28', sleeve: '9', shoulder: '19' },
            { size: 'XL', chest: '42-44', length: '29', sleeve: '9.5', shoulder: '20' }
          ]
        }
      },
      {
        name: 'Size Test Hoodie - Limited Sizes',
        description: 'Hoodie with limited size options for testing size selection',
        shortDescription: 'Size test hoodie',
        price: 1999,
        sku: `SIZE-TEST-HOODIE-${Date.now()}`,
        gstRate: 18,
        gstType: 'CGST_SGST',
        hsnCode: '6110',
        sizes: [
          {
            name: 'M',
            label: 'Medium',
            stock: 3,
            isAvailable: true,
            measurements: {
              chest: '40-42',
              length: '28',
              sleeve: '24'
            },
            sortOrder: 1
          },
          {
            name: 'L',
            label: 'Large',
            stock: 5,
            isAvailable: true,
            measurements: {
              chest: '42-44',
              length: '29',
              sleeve: '25'
            },
            sortOrder: 2
          }
        ],
        sizeChart: {
          enabled: true,
          description: 'Hoodie size guide. Measurements are in inches.'
        }
      },
      {
        name: 'No Size Test Accessory',
        description: 'Accessory without size options for testing mixed cart scenarios',
        shortDescription: 'No size accessory',
        price: 499,
        sku: `NO-SIZE-TEST-${Date.now()}`,
        gstRate: 18,
        gstType: 'CGST_SGST',
        hsnCode: '9999',
        sizes: [], // No sizes
        sizeChart: {
          enabled: false
        }
      }
    ];

    console.log('\n🧪 Creating size test products...\n');

    for (const productData of testProducts) {
      try {
        const product = new Product({
          ...productData,
          category: category._id,
          trackQuantity: true,
          quantity: productData.sizes.reduce((total, size) => total + size.stock, 10), // Total stock
          isActive: true,
          images: [{
            url: '/uploads/test-product.jpg',
            alt: productData.name,
            isMain: true
          }]
        });

        const savedProduct = await product.save();
        
        console.log(`✅ ${savedProduct.name}`);
        console.log(`   Product ID: ${savedProduct._id}`);
        console.log(`   Slug: ${savedProduct.slug}`);
        console.log(`   Number of sizes: ${savedProduct.sizes.length}`);
        
        if (savedProduct.sizes.length > 0) {
          console.log(`   Available sizes: ${savedProduct.sizes.filter(s => s.isAvailable).map(s => s.name).join(', ')}`);
          console.log(`   In-stock sizes: ${savedProduct.sizes.filter(s => s.stock > 0).map(s => `${s.name}(${s.stock})`).join(', ')}`);
        }
        
        console.log(`   Size chart: ${savedProduct.sizeChart.enabled ? 'Enabled' : 'Disabled'}\n`);

      } catch (error) {
        console.log(`❌ Failed to create ${productData.name}:`, error.message);
      }
    }

    // Verify products in database
    console.log('🔍 Verifying size test products in database...\n');
    
    const sizeProducts = await Product.find({ 
      name: { $regex: 'Size Test', $options: 'i' } 
    });
    
    console.log(`Found ${sizeProducts.length} size test products:`);
    
    sizeProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.sizes.length} sizes, Chart: ${product.sizeChart.enabled}`);
    });

    console.log('\n✅ Size test products created successfully!');
    console.log('\n📋 Next steps for testing:');
    console.log('1. Check admin panel - products should show size management');
    console.log('2. Check product pages - should show size selectors');
    console.log('3. Test size selection and add to cart');
    console.log('4. Check cart - should preserve size information');
    console.log('5. Test checkout - should include size data in order');
    console.log('\n🧪 Run testSizeFlow.runAllTests() in browser console to test the complete flow');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  createSizeTestProducts();
}

module.exports = createSizeTestProducts;
