const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testUploadEndpoints() {
  const baseURL = process.env.BACKEND_URL || 'http://localhost:5001';
  console.log(`🔍 Testing Upload Endpoints at: ${baseURL}\n`);
  
  // First, we need to login as admin to get the token
  let authToken;
  
  try {
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: process.env.ADMIN_EMAIL || 'admin@clothingstore.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Admin login successful\n');
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    console.log('   Make sure your admin credentials are correct in .env file');
    return;
  }
  
  // Test upload with a remote image URL (Cloudinary can handle this)
  try {
    console.log('📤 Testing image upload with remote URL...');
    
    // Use a simple 1x1 pixel PNG as test data
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-pixel.png',
      contentType: 'image/png'
    });
    
    const uploadResponse = await axios.post(`${baseURL}/api/upload/image`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Image upload successful!');
    console.log(`   URL: ${uploadResponse.data.image.url}`);
    console.log(`   Public ID: ${uploadResponse.data.image.publicId}`);
    console.log(`   Size: ${uploadResponse.data.image.size} bytes`);
    console.log(`   Original Name: ${uploadResponse.data.image.originalName}\n`);
    
    // Verify the URL is a Cloudinary URL
    if (uploadResponse.data.image.url.includes('cloudinary.com')) {
      console.log('✅ Confirmed: Image uploaded to Cloudinary\n');
    } else {
      console.log('⚠️ Warning: Image URL does not appear to be from Cloudinary\n');
    }
    
    // Test image deletion
    console.log('🗑️ Testing image deletion...');
    const deleteResponse = await axios.delete(
      `${baseURL}/api/upload/image/${uploadResponse.data.image.publicId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Image deletion successful');
    console.log(`   Result: ${deleteResponse.data.result}\n`);
    
  } catch (error) {
    console.log('❌ Upload test failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log(`   Full response:`, error.response.data);
    }
    
    // Check if it's a Cloudinary configuration issue
    if (error.message.includes('cloudinary') || error.response?.data?.message?.includes('cloudinary')) {
      console.log('\n💡 This might be a Cloudinary configuration issue.');
      console.log('   Please verify your Cloudinary credentials in the .env file:');
      console.log(`   - CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing'}`);
      console.log(`   - CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing'}`);
      console.log(`   - CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'}`);
    }
  }
  
  console.log('\n🎉 Upload endpoints verification complete!');
}

// Run the test
testUploadEndpoints().catch(console.error);
