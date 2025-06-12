const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a simple test image
const createTestImage = () => {
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  const width = 200;
  const height = 200;
  const canvasElement = createCanvas(width, height);
  const ctx = canvasElement.getContext('2d');
  
  // Create a simple colored rectangle
  ctx.fillStyle = '#FF6B6B';
  ctx.fillRect(0, 0, width, height);
  
  // Add some text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TEST IMAGE', width/2, height/2);
  
  return canvasElement.toBuffer('image/png');
};

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
    return;
  }
  
  // Test single image upload
  try {
    console.log('📤 Testing single image upload...');
    
    // Create test image buffer
    let imageBuffer;
    try {
      imageBuffer = createTestImage();
    } catch (canvasError) {
      console.log('⚠️ Canvas not available, using placeholder URL instead');
      // Fallback: create a simple buffer with some data
      imageBuffer = Buffer.from('fake-image-data-for-testing');
    }
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const uploadResponse = await axios.post(`${baseURL}/api/upload/image`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Single image upload successful');
    console.log(`   URL: ${uploadResponse.data.image.url}`);
    console.log(`   Public ID: ${uploadResponse.data.image.publicId}`);
    console.log(`   Size: ${uploadResponse.data.image.size} bytes\n`);
    
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
    console.log('❌ Single image upload/delete failed:', error.response?.data?.message || error.message);
    console.log('   Full error:', error.response?.data || error.message);
  }
  
  // Test multiple images upload
  try {
    console.log('📤 Testing multiple images upload...');
    
    const formData = new FormData();
    
    // Add multiple test images
    for (let i = 1; i <= 3; i++) {
      let imageBuffer;
      try {
        imageBuffer = createTestImage();
      } catch (canvasError) {
        imageBuffer = Buffer.from(`fake-image-data-${i}-for-testing`);
      }
      
      formData.append('images', imageBuffer, {
        filename: `test-image-${i}.png`,
        contentType: 'image/png'
      });
    }
    
    const uploadResponse = await axios.post(`${baseURL}/api/upload/images`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Multiple images upload successful');
    console.log(`   Uploaded ${uploadResponse.data.images.length} images:`);
    
    uploadResponse.data.images.forEach((img, index) => {
      console.log(`   ${index + 1}. URL: ${img.url}`);
      console.log(`      Public ID: ${img.publicId}`);
      console.log(`      Size: ${img.size} bytes`);
    });
    
    // Clean up - delete the uploaded images
    console.log('\n🧹 Cleaning up uploaded images...');
    for (const img of uploadResponse.data.images) {
      try {
        await axios.delete(`${baseURL}/api/upload/image/${img.publicId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        console.log(`   ✅ Deleted: ${img.publicId}`);
      } catch (deleteError) {
        console.log(`   ⚠️ Failed to delete: ${img.publicId}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Multiple images upload failed:', error.response?.data?.message || error.message);
    console.log('   Full error:', error.response?.data || error.message);
  }
  
  console.log('\n🎉 Upload endpoints verification complete!');
}

// Run the test
testUploadEndpoints().catch(console.error);
