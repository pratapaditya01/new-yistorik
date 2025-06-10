// Optimized Image utility functions with caching and lazy loading support

// Generate a local placeholder image data URL
const generateLocalPlaceholder = (width = 300, height = 300, text = 'No Image') => {
  // Create a simple SVG placeholder that works offline
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <circle cx="50%" cy="40%" r="20" fill="#e5e7eb"/>
      <path d="M${width*0.3} ${height*0.6} L${width*0.7} ${height*0.6} L${width*0.6} ${height*0.8} L${width*0.4} ${height*0.8} Z" fill="#e5e7eb"/>
      <text x="50%" y="90%" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Local placeholder images
const PLACEHOLDER_IMAGE = generateLocalPlaceholder(300, 300, 'No Image');
const PLACEHOLDER_PRODUCT = generateLocalPlaceholder(300, 300, 'Product Image');
const PLACEHOLDER_ERROR = generateLocalPlaceholder(300, 300, 'Image Error');

// Dynamic API URL configuration for images
const getApiBaseUrl = () => {
  // Check if we're in development
  if (typeof window !== 'undefined') {
    const currentDomain = window.location.hostname;

    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      return 'http://localhost:5001';
    }

    if (currentDomain === 'yistorik.in' || currentDomain === 'www.yistorik.in') {
      // Production domain - use your backend URL
      return 'https://new-yistorik.onrender.com';
    }
  }

  // Fallback for SSR or Vercel deployments
  return 'https://new-yistorik.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

// Cache for processed image URLs
const imageUrlCache = new Map();

/**
 * Get the full URL for an image with caching
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @param {Object} options - Image optimization options
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE;
  }

  // Check cache first
  const cacheKey = `${imageUrl}_${JSON.stringify(options)}`;
  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey);
  }

  let processedUrl;

  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    processedUrl = imageUrl;
  }
  // If it's a relative URL starting with /uploads/, construct full URL
  else if (imageUrl.startsWith('/uploads/')) {
    processedUrl = `${API_BASE_URL}${imageUrl}`;
  }
  // If it's just a filename, use uploads path
  else if (!imageUrl.startsWith('/')) {
    processedUrl = `${API_BASE_URL}/uploads/${imageUrl}`;
  }
  // Fallback to direct URL construction
  else {
    processedUrl = `${API_BASE_URL}${imageUrl}`;
  }

  // Add image optimization parameters if supported
  if (options.width || options.height || options.quality) {
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
    if (options.quality) params.append('q', options.quality);

    const separator = processedUrl.includes('?') ? '&' : '?';
    processedUrl = `${processedUrl}${separator}${params.toString()}`;
  }

  // Cache the result
  imageUrlCache.set(cacheKey, processedUrl);

  // Limit cache size to prevent memory leaks
  if (imageUrlCache.size > 1000) {
    const firstKey = imageUrlCache.keys().next().value;
    imageUrlCache.delete(firstKey);
  }

  return processedUrl;
};

/**
 * Get the main image URL from a product's images array
 * @param {Array} images - Array of image objects
 * @returns {string} - The main image URL
 */
export const getMainImageUrl = (images) => {
  // Handle null, undefined, or empty arrays
  if (!images || !Array.isArray(images) || images.length === 0) {
    return PLACEHOLDER_PRODUCT;
  }

  try {
    // Find the main image
    const mainImage = images.find(img => img && img.isMain && img.url);
    if (mainImage && mainImage.url) {
      return getImageUrl(mainImage.url);
    }

    // If no main image, use the first one with a URL
    const firstImageWithUrl = images.find(img => img && img.url);
    if (firstImageWithUrl && firstImageWithUrl.url) {
      return getImageUrl(firstImageWithUrl.url);
    }

    // Fallback if no valid images found
    return PLACEHOLDER_PRODUCT;
  } catch (error) {
    console.warn('Error processing image URL:', error);
    return PLACEHOLDER_ERROR;
  }
};

/**
 * Get all image URLs from a product's images array
 * @param {Array} images - Array of image objects
 * @returns {Array} - Array of full image URLs
 */
export const getAllImageUrls = (images) => {
  if (!images || images.length === 0) {
    return [PLACEHOLDER_PRODUCT];
  }

  return images.map(img => getImageUrl(img.url));
};

/**
 * Get a placeholder image URL
 * @param {string} type - Type of placeholder ('product', 'error', 'default')
 * @param {number} width - Width of placeholder
 * @param {number} height - Height of placeholder
 * @param {string} text - Text to display
 * @returns {string} - Placeholder image data URL
 */
export const getPlaceholderUrl = (type = 'default', width = 300, height = 300, text = 'No Image') => {
  switch (type) {
    case 'product':
      return generateLocalPlaceholder(width, height, text || 'Product Image');
    case 'error':
      return generateLocalPlaceholder(width, height, text || 'Image Error');
    default:
      return generateLocalPlaceholder(width, height, text);
  }
};
