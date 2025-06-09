const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

console.log('🔍 Performance Analysis Report');
console.log('================================');

async function analyzePerformance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Database Statistics
    console.log('\n📊 DATABASE STATISTICS');
    console.log('----------------------');
    
    const stats = await db.stats();
    console.log(`Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Objects: ${stats.objects}`);

    // Collection Statistics
    console.log('\n📋 COLLECTION ANALYSIS');
    console.log('----------------------');
    
    const collections = ['products', 'orders', 'users', 'categories'];
    
    for (const collectionName of collections) {
      try {
        const collStats = await db.collection(collectionName).stats();
        const indexes = await db.collection(collectionName).indexes();
        
        console.log(`\n${collectionName.toUpperCase()}:`);
        console.log(`  Documents: ${collStats.count}`);
        console.log(`  Size: ${(collStats.size / 1024).toFixed(2)} KB`);
        console.log(`  Indexes: ${indexes.length}`);
        console.log(`  Index Names: ${indexes.map(idx => idx.name).join(', ')}`);
      } catch (error) {
        console.log(`\n${collectionName.toUpperCase()}: Collection not found`);
      }
    }

    // Query Performance Analysis
    console.log('\n⚡ QUERY PERFORMANCE TESTS');
    console.log('---------------------------');

    // Test product queries
    console.log('\nTesting Product Queries:');
    let start = Date.now();
    await Product.find({ isActive: true }).limit(10);
    console.log(`  Basic product query: ${Date.now() - start}ms`);

    start = Date.now();
    await Product.find({ isActive: true }).populate('category').limit(10);
    console.log(`  Product with category: ${Date.now() - start}ms`);

    start = Date.now();
    await Product.find({ price: { $gte: 10, $lte: 100 } }).limit(10);
    console.log(`  Price range query: ${Date.now() - start}ms`);

    // Test order queries
    console.log('\nTesting Order Queries:');
    start = Date.now();
    await Order.find().sort({ createdAt: -1 }).limit(10);
    console.log(`  Recent orders: ${Date.now() - start}ms`);

    start = Date.now();
    await Order.find().populate('user', 'name email').limit(10);
    console.log(`  Orders with user: ${Date.now() - start}ms`);

    // Memory Usage
    console.log('\n💾 MEMORY USAGE');
    console.log('---------------');
    const memUsage = process.memoryUsage();
    console.log(`RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);

    // Recommendations
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS');
    console.log('--------------------------------');
    
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();

    if (productCount > 1000) {
      console.log('⚠️  Consider implementing product pagination with smaller page sizes');
    }
    
    if (orderCount > 5000) {
      console.log('⚠️  Consider archiving old orders to improve query performance');
    }

    if (stats.indexSize > stats.dataSize) {
      console.log('⚠️  Index size is larger than data size - review index usage');
    }

    console.log('\n✅ Performance analysis completed!');

  } catch (error) {
    console.error('❌ Error during performance analysis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

analyzePerformance();
