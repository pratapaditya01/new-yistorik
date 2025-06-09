const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Order = require('../models/Order');

console.log('🔄 Removing sample orders...');

async function removeSampleOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    // Get count of existing orders
    const orderCount = await Order.countDocuments();
    console.log(`📋 Found ${orderCount} orders in database`);

    if (orderCount === 0) {
      console.log('ℹ️  No orders found to remove');
      return;
    }

    // Remove all orders
    const result = await Order.deleteMany({});
    console.log(`🗑️  Removed ${result.deletedCount} orders`);

    console.log('🎉 Sample orders removed successfully!');

  } catch (error) {
    console.error('❌ Error removing sample orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

removeSampleOrders();
