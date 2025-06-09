const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔄 Creating database indexes for optimization...');

async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Product indexes for better query performance
    console.log('📊 Creating Product indexes...');
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ isActive: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ subcategory: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ averageRating: -1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ sortOrder: 1, createdAt: -1 });
    await db.collection('products').createIndex({ 
      name: 'text', 
      description: 'text', 
      tags: 'text' 
    }, { 
      name: 'product_text_search' 
    });
    
    // Compound indexes for common queries
    await db.collection('products').createIndex({ 
      isActive: 1, 
      category: 1, 
      price: 1 
    });
    await db.collection('products').createIndex({ 
      trackQuantity: 1, 
      quantity: 1, 
      lowStockThreshold: 1 
    });

    // User indexes
    console.log('👤 Creating User indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ lastLogin: -1 });

    // Order indexes
    console.log('📦 Creating Order indexes...');
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ user: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ isPaid: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1, createdAt: -1 });

    // Category indexes
    console.log('📂 Creating Category indexes...');
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ isActive: 1 });
    await db.collection('categories').createIndex({ sortOrder: 1, name: 1 });
    await db.collection('categories').createIndex({ parentCategory: 1 });

    console.log('🎉 All indexes created successfully!');
    console.log('📈 Database queries should now be significantly faster');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

createIndexes();
