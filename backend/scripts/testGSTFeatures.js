const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

console.log('🧾 TESTING GST FEATURES');
console.log('=======================\n');

async function testGSTFeatures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // Get a category for testing
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('❌ No categories found. Please create a category first.');
      return;
    }

    console.log(`📂 Using category: ${categories[0].name}`);

    // Test 1: Create product with GST information
    console.log('\n🧪 TEST 1: Creating product with GST information');
    console.log('------------------------------------------------');
    
    const gstProductData = {
      name: 'GST Test Product - Cotton T-Shirt',
      description: 'A premium cotton t-shirt with GST compliance for Indian market',
      shortDescription: 'Premium cotton t-shirt',
      price: 999.00,
      comparePrice: 1299.00,
      sku: `GST-TEST-${Date.now()}`,
      category: categories[0]._id,
      trackQuantity: true,
      quantity: 50,
      isActive: true,
      isFeatured: false,
      // GST fields
      gstRate: 12, // 12% GST for textiles
      gstType: 'CGST_SGST',
      hsnCode: '6109', // HSN code for T-shirts
      gstInclusive: false,
      taxable: true,
      images: [{
        url: '/uploads/sample-product.jpg',
        alt: 'GST Test Product',
        isMain: true
      }]
    };

    try {
      const gstProduct = new Product(gstProductData);
      const savedGSTProduct = await gstProduct.save();
      console.log('✅ GST Product created successfully!');
      console.log(`   Name: ${savedGSTProduct.name}`);
      console.log(`   Price: ₹${savedGSTProduct.price}`);
      console.log(`   GST Rate: ${savedGSTProduct.gstRate}%`);
      console.log(`   GST Type: ${savedGSTProduct.gstType}`);
      console.log(`   HSN Code: ${savedGSTProduct.hsnCode}`);
      console.log(`   GST Inclusive: ${savedGSTProduct.gstInclusive}`);
      console.log(`   Taxable: ${savedGSTProduct.taxable}`);
    } catch (error) {
      console.log('❌ GST Product creation failed:', error.message);
    }

    // Test 2: Create product with different GST rates
    console.log('\n🧪 TEST 2: Testing different GST rates');
    console.log('-------------------------------------');
    
    const gstRates = [
      { rate: 5, type: 'CGST_SGST', hsn: '0901', name: 'Coffee Beans (5% GST)' },
      { rate: 18, type: 'IGST', hsn: '6403', name: 'Leather Shoes (18% GST)' },
      { rate: 28, type: 'CGST_SGST', hsn: '3401', name: 'Luxury Soap (28% GST)' },
      { rate: 0, type: 'EXEMPT', hsn: '1006', name: 'Rice (Exempt)' }
    ];

    for (const gstInfo of gstRates) {
      try {
        const testProduct = new Product({
          name: gstInfo.name,
          description: `Test product for ${gstInfo.rate}% GST rate`,
          shortDescription: `${gstInfo.rate}% GST test`,
          price: 500.00,
          sku: `GST-${gstInfo.rate}-${Date.now()}`,
          category: categories[0]._id,
          trackQuantity: true,
          quantity: 10,
          isActive: true,
          gstRate: gstInfo.rate,
          gstType: gstInfo.type,
          hsnCode: gstInfo.hsn,
          gstInclusive: false,
          taxable: gstInfo.rate > 0,
          images: [{
            url: '/uploads/sample-product.jpg',
            alt: gstInfo.name,
            isMain: true
          }]
        });

        const saved = await testProduct.save();
        console.log(`✅ ${gstInfo.name} - GST: ${saved.gstRate}%, HSN: ${saved.hsnCode}`);
      } catch (error) {
        console.log(`❌ Failed to create ${gstInfo.name}:`, error.message);
      }
    }

    // Test 3: Query products with GST information
    console.log('\n🧪 TEST 3: Querying products with GST information');
    console.log('------------------------------------------------');
    
    const allProducts = await Product.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Found ${allProducts.length} products:`);
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   GST Rate: ${product.gstRate || 'Not set'}%`);
      console.log(`   GST Type: ${product.gstType || 'Not set'}`);
      console.log(`   HSN Code: ${product.hsnCode || 'Not set'}`);
      console.log(`   GST Inclusive: ${product.gstInclusive || false}`);
      console.log(`   Taxable: ${product.taxable !== undefined ? product.taxable : 'Not set'}`);
      console.log('');
    });

    // Test 4: Calculate GST amounts
    console.log('\n🧪 TEST 4: GST Calculation Examples');
    console.log('----------------------------------');
    
    const sampleProducts = allProducts.filter(p => p.gstRate !== undefined).slice(0, 3);
    
    sampleProducts.forEach(product => {
      const basePrice = product.price;
      const gstRate = product.gstRate;
      
      if (product.gstInclusive) {
        // Price includes GST - calculate base price and GST amount
        const gstAmount = (basePrice * gstRate) / (100 + gstRate);
        const basePriceExGST = basePrice - gstAmount;
        console.log(`📊 ${product.name} (GST Inclusive):`);
        console.log(`   Total Price: ₹${basePrice.toFixed(2)}`);
        console.log(`   Base Price (ex-GST): ₹${basePriceExGST.toFixed(2)}`);
        console.log(`   GST Amount (${gstRate}%): ₹${gstAmount.toFixed(2)}`);
      } else {
        // Price excludes GST - calculate GST amount and total price
        const gstAmount = (basePrice * gstRate) / 100;
        const totalPrice = basePrice + gstAmount;
        console.log(`📊 ${product.name} (GST Exclusive):`);
        console.log(`   Base Price: ₹${basePrice.toFixed(2)}`);
        console.log(`   GST Amount (${gstRate}%): ₹${gstAmount.toFixed(2)}`);
        console.log(`   Total Price: ₹${totalPrice.toFixed(2)}`);
      }
      console.log('');
    });

    console.log('🎉 GST features test completed successfully!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

testGSTFeatures();
