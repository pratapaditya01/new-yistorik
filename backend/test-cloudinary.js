const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  console.log('🔍 Testing Cloudinary Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing'}`);
  console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'}\n`);
  
  // Test API connection
  try {
    console.log('🔗 Testing API Connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API Connection: SUCCESS');
    console.log(`Response: ${JSON.stringify(result)}\n`);
  } catch (error) {
    console.log('❌ Cloudinary API Connection: FAILED');
    console.log(`Error: ${error.message}\n`);
    return;
  }
  
  // Test upload with a sample image URL
  try {
    console.log('📤 Testing Image Upload...');
    const uploadResult = await cloudinary.uploader.upload(
      'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=TEST',
      {
        folder: 'clothing-store/test',
        public_id: 'test-upload-' + Date.now(),
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );
    
    console.log('✅ Image Upload: SUCCESS');
    console.log(`Public ID: ${uploadResult.public_id}`);
    console.log(`URL: ${uploadResult.secure_url}`);
    console.log(`Size: ${uploadResult.bytes} bytes\n`);
    
    // Test image deletion
    console.log('🗑️ Testing Image Deletion...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Image Deletion: SUCCESS');
    console.log(`Result: ${deleteResult.result}\n`);
    
  } catch (error) {
    console.log('❌ Image Upload/Delete: FAILED');
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test folder listing
  try {
    console.log('📁 Testing Folder Access...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'clothing-store/',
      max_results: 5
    });
    
    console.log('✅ Folder Access: SUCCESS');
    console.log(`Found ${resources.resources.length} resources in clothing-store/ folder`);
    
    if (resources.resources.length > 0) {
      console.log('Recent uploads:');
      resources.resources.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.public_id} (${resource.format}, ${resource.bytes} bytes)`);
      });
    }
    
  } catch (error) {
    console.log('❌ Folder Access: FAILED');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n🎉 Cloudinary verification complete!');
}

// Run the test
testCloudinaryConnection().catch(console.error);
