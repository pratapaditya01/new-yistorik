// Image utility functions

const API_BASE_URL = 'http://localhost:5001';

/**
 * Get the full URL for an image
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return '/placeholder-image.jpg';
  }

  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a relative URL starting with /uploads/, use API endpoint
  if (imageUrl.startsWith('/uploads/')) {
    const filename = imageUrl.replace('/uploads/', '');
    return `${API_BASE_URL}/api/upload/image/${filename}`;
  }

  // If it's just a filename, use API endpoint
  if (!imageUrl.startsWith('/')) {
    return `${API_BASE_URL}/api/upload/image/${imageUrl}`;
  }

  // Fallback to direct URL construction
  return `${API_BASE_URL}${imageUrl}`;
};

/**
 * Get the main image URL from a product's images array
 * @param {Array} images - Array of image objects
 * @returns {string} - The main image URL
 */
export const getMainImageUrl = (images) => {
  if (!images || images.length === 0) {
    return '/placeholder-image.jpg';
  }
  
  // Find the main image
  const mainImage = images.find(img => img.isMain);
  if (mainImage) {
    return getImageUrl(mainImage.url);
  }
  
  // If no main image, use the first one
  return getImageUrl(images[0].url);
};

/**
 * Get all image URLs from a product's images array
 * @param {Array} images - Array of image objects
 * @returns {Array} - Array of full image URLs
 */
export const getAllImageUrls = (images) => {
  if (!images || images.length === 0) {
    return ['/placeholder-image.jpg'];
  }
  
  return images.map(img => getImageUrl(img.url));
};
