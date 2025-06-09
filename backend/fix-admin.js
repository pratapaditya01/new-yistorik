const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔧 Fixing Admin User');
console.log('==================');

async function fixAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    // Define User schema inline to avoid import issues
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      isActive: { type: Boolean, default: true }
    });

    // Add comparePassword method
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.model('User', userSchema);

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@example.com' });
    console.log('🗑️  Deleted existing admin user');

    // Create new admin user with proper password hash
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Created new admin user');

    // Test the password
    const testUser = await User.findOne({ email: 'admin@example.com' });
    const isPasswordValid = await testUser.comparePassword('admin123');
    console.log('🔑 Password test result:', isPasswordValid);

    console.log('📋 Admin user details:');
    console.log('   Email:', testUser.email);
    console.log('   Role:', testUser.role);
    console.log('   Active:', testUser.isActive);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixAdmin();
