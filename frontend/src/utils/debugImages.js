/**
 * Debug utilities for image loading issues
 */

/**
 * Test if an image URL is accessible
 * @param {string} url - Image URL to test
 * @returns {Promise<Object>} - Test result
 */
export const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    const startTime = Date.now();
    
    img.onload = () => {
      resolve({
        url,
        status: 'success',
        loadTime: Date.now() - startTime,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    };
    
    img.onerror = (error) => {
      resolve({
        url,
        status: 'error',
        loadTime: Date.now() - startTime,
        error: error.message || 'Failed to load'
      });
    };
    
    img.src = url;
  });
};

/**
 * Test multiple image URLs
 * @param {string[]} urls - Array of image URLs to test
 * @returns {Promise<Object[]>} - Array of test results
 */
export const testMultipleImages = async (urls) => {
  console.group('🖼️ TESTING IMAGE URLS');
  
  const results = await Promise.all(urls.map(testImageUrl));
  
  results.forEach((result, index) => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.url}`);
    if (result.status === 'success') {
      console.log(`   Size: ${result.naturalWidth}x${result.naturalHeight}, Load time: ${result.loadTime}ms`);
    } else {
      console.log(`   Error: ${result.error}, Load time: ${result.loadTime}ms`);
    }
  });
  
  console.groupEnd();
  return results;
};

/**
 * Debug product images
 * @param {Object} product - Product object with images array
 */
export const debugProductImages = async (product) => {
  console.group(`🔍 DEBUGGING PRODUCT IMAGES: ${product.name}`);
  
  if (!product.images || product.images.length === 0) {
    console.warn('No images found in product');
    console.groupEnd();
    return;
  }
  
  console.log('Raw images array:', product.images);
  
  const imageUrls = product.images.map(img => img.url);
  console.log('Extracted URLs:', imageUrls);
  
  // Test each image URL
  await testMultipleImages(imageUrls);
  
  console.groupEnd();
};

/**
 * Check if images are being blocked by browser
 */
export const checkImageBlocking = () => {
  console.group('🚫 CHECKING IMAGE BLOCKING');
  
  // Check for ad blockers or content blockers
  const testUrls = [
    'https://new-yistorik.onrender.com/uploads/test.jpg',
    'https://placehold.co/300x300?text=Test',
    'https://via.placeholder.com/300x300',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'
  ];
  
  testMultipleImages(testUrls).then(results => {
    const blocked = results.filter(r => r.status === 'error');
    if (blocked.length > 0) {
      console.warn('Some image services may be blocked:', blocked.map(r => r.url));
    } else {
      console.log('All test image services are accessible');
    }
  });
  
  console.groupEnd();
};

/**
 * Monitor image loading on the current page
 */
export const monitorPageImages = () => {
  console.group('👁️ MONITORING PAGE IMAGES');
  
  const images = document.querySelectorAll('img');
  console.log(`Found ${images.length} images on page`);
  
  images.forEach((img, index) => {
    const status = img.complete && img.naturalHeight !== 0 ? '✅' : '❌';
    console.log(`${status} Image ${index + 1}: ${img.src}`);
    
    if (!img.complete || img.naturalHeight === 0) {
      console.log(`   Alt: ${img.alt}`);
      console.log(`   Classes: ${img.className}`);
    }
  });
  
  console.groupEnd();
};

/**
 * Debug image fallback system
 */
export const debugImageFallbacks = () => {
  console.group('🔄 DEBUGGING IMAGE FALLBACK SYSTEM');
  
  // Check if ImageWithFallback components are working
  const images = document.querySelectorAll('img');
  const fallbackImages = Array.from(images).filter(img => 
    img.src.includes('data:image/svg+xml') || 
    img.src.includes('placehold.co') ||
    img.src.includes('placeholder')
  );
  
  console.log(`Total images: ${images.length}`);
  console.log(`Fallback images: ${fallbackImages.length}`);
  
  if (fallbackImages.length > 0) {
    console.log('Images using fallbacks:');
    fallbackImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.alt || 'No alt text'} - ${img.src.substring(0, 100)}...`);
    });
  }
  
  console.groupEnd();
};

// Export all debug functions
export default {
  testImageUrl,
  testMultipleImages,
  debugProductImages,
  checkImageBlocking,
  monitorPageImages,
  debugImageFallbacks
};
