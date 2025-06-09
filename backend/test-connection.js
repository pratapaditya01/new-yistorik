const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🧪 Testing MongoDB Connection...');

async function testConnection() {
  try {
    console.log('🔄 Connecting...');
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ Connection successful!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Ready State:', conn.connection.readyState);
    
    await mongoose.disconnect();
    console.log('🔚 Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
