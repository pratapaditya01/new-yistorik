const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 MongoDB Connection Debug Test');
console.log('================================');

// Log environment variables (without showing password)
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
  console.log('📋 MongoDB URI (masked):', maskedUri);
} else {
  console.log('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Test connection with detailed logging
async function testConnection() {
  try {
    console.log('\n🔄 Attempting to connect to MongoDB...');
    
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };

    console.log('⚙️  Connection options:', JSON.stringify(options, null, 2));

    const conn = await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('🗄️  Database:', conn.connection.name);
    console.log('📊 Ready State:', conn.connection.readyState);
    
    // Test a simple operation
    console.log('\n🧪 Testing database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.log('\n❌ Connection failed!');
    console.log('🔍 Error details:');
    console.log('   Type:', error.constructor.name);
    console.log('   Message:', error.message);
    
    if (error.code) {
      console.log('   Code:', error.code);
    }
    
    if (error.codeName) {
      console.log('   Code Name:', error.codeName);
    }
    
    // Common error diagnostics
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 DNS Resolution Issue:');
      console.log('   - Check internet connection');
      console.log('   - Verify cluster hostname');
      console.log('   - Check firewall settings');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication Issue:');
      console.log('   - Check username and password');
      console.log('   - Verify database user permissions');
      console.log('   - Check if user exists in correct database');
    }
    
    if (error.message.includes('IP')) {
      console.log('\n💡 IP Whitelist Issue:');
      console.log('   - Add your IP to MongoDB Atlas whitelist');
      console.log('   - Or add 0.0.0.0/0 for all IPs (development only)');
    }
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 Timeout Issue:');
      console.log('   - Check network connectivity');
      console.log('   - Verify MongoDB Atlas cluster is running');
      console.log('   - Check if cluster is paused');
    }
    
  } finally {
    console.log('\n🔚 Closing connection...');
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Handle process events
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, closing connection...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.log('\n💥 Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Start the test
testConnection();
