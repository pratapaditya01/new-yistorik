const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import User model
const User = require('./models/User');

console.log('🔍 Authentication Debug Test');
console.log('============================');

async function debugAuth() {
  try {
    // Connect to MongoDB
    const options = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    console.log('\n🔍 Checking for admin user...');
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('📝 Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user found');
      console.log('📋 User details:');
      console.log('   ID:', adminUser._id);
      console.log('   Name:', adminUser.name);
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Password Hash:', adminUser.password.substring(0, 20) + '...');
    }

    // Test password comparison
    console.log('\n🧪 Testing password comparison...');
    const testUser = await User.findOne({ email: 'admin@example.com' });
    
    if (testUser) {
      // Test with correct password
      const isValidPassword = await testUser.comparePassword('admin123');
      console.log('✅ Password "admin123" valid:', isValidPassword);
      
      // Test with wrong password
      const isInvalidPassword = await testUser.comparePassword('wrongpassword');
      console.log('❌ Password "wrongpassword" valid:', isInvalidPassword);
      
      // Test bcrypt directly
      const directCompare = await bcrypt.compare('admin123', testUser.password);
      console.log('🔧 Direct bcrypt compare:', directCompare);
    }

    // Test the login route logic
    console.log('\n🔍 Testing login logic...');
    const email = 'admin@example.com';
    const password = 'admin123';
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found during login test');
    } else {
      console.log('✅ User found during login test');
      const isMatch = await user.comparePassword(password);
      console.log('🔑 Password match result:', isMatch);
      
      if (isMatch) {
        console.log('✅ Login should succeed');
      } else {
        console.log('❌ Login should fail');
      }
    }

    // List all users
    console.log('\n👥 All users in database:');
    const allUsers = await User.find({}, 'name email role');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

debugAuth();
