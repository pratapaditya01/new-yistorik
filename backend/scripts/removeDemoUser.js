const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

console.log('🔄 Removing demo user...');

async function removeDemoUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    // Find and remove demo user
    const demoUser = await User.findOneAndDelete({ email: 'demo@example.com' });
    
    if (demoUser) {
      console.log(`🗑️  Removed demo user: ${demoUser.email}`);
    } else {
      console.log('ℹ️  No demo user found to remove');
    }

    console.log('🎉 Demo user removal completed!');

  } catch (error) {
    console.error('❌ Error removing demo user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

removeDemoUser();
