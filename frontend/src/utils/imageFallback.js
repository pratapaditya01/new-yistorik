/**
 * Image Fallback Utility
 * Provides reliable local image fallbacks without external dependencies
 */

/**
 * Generate a local SVG placeholder image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display
 * @param {string} bgColor - Background color
 * @param {string} textColor - Text color
 * @returns {string} - Data URL for SVG image
 */
export const generateSVGPlaceholder = (
  width = 300, 
  height = 300, 
  text = 'No Image', 
  bgColor = '#f3f4f6', 
  textColor = '#9ca3af'
) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <g transform="translate(${width/2}, ${height*0.4})">
        <!-- Camera icon -->
        <rect x="-20" y="-10" width="40" height="25" rx="4" fill="${textColor}" opacity="0.3"/>
        <circle cx="0" cy="2" r="8" fill="${textColor}" opacity="0.3"/>
        <circle cx="0" cy="2" r="5" fill="${textColor}" opacity="0.5"/>
        <rect x="10" y="-8" width="4" height="3" rx="1" fill="${textColor}" opacity="0.3"/>
      </g>
      <text x="50%" y="${height*0.75}" font-family="Arial, sans-serif" font-size="${Math.max(12, width/20)}" fill="${textColor}" text-anchor="middle">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a canvas-based placeholder image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display
 * @param {string} bgColor - Background color
 * @param {string} textColor - Text color
 * @returns {string} - Data URL for canvas image
 */
export const generateCanvasPlaceholder = (
  width = 300, 
  height = 300, 
  text = 'No Image', 
  bgColor = '#f3f4f6', 
  textColor = '#9ca3af'
) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw camera icon
    const centerX = width / 2;
    const centerY = height * 0.4;
    
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.3;
    
    // Camera body
    ctx.fillRect(centerX - 20, centerY - 10, 40, 25);
    
    // Camera lens
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add text
    ctx.globalAlpha = 1;
    ctx.fillStyle = textColor;
    ctx.font = `${Math.max(12, width / 20)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, height * 0.75);
    
    return canvas.toDataURL();
  } catch (error) {
    console.warn('Canvas placeholder generation failed, falling back to SVG:', error);
    return generateSVGPlaceholder(width, height, text, bgColor, textColor);
  }
};

/**
 * Predefined placeholder images for common use cases
 */
export const PLACEHOLDER_IMAGES = {
  product: generateSVGPlaceholder(300, 300, 'Product Image', '#f9fafb', '#6b7280'),
  avatar: generateSVGPlaceholder(100, 100, 'User', '#f3f4f6', '#9ca3af'),
  error: generateSVGPlaceholder(300, 300, 'Image Error', '#fef2f2', '#ef4444'),
  loading: generateSVGPlaceholder(300, 300, 'Loading...', '#f0f9ff', '#3b82f6'),
  noImage: generateSVGPlaceholder(300, 300, 'No Image', '#f3f4f6', '#9ca3af'),
  thumbnail: generateSVGPlaceholder(150, 150, 'Thumbnail', '#f9fafb', '#6b7280'),
  banner: generateSVGPlaceholder(800, 200, 'Banner Image', '#f9fafb', '#6b7280'),
  square: generateSVGPlaceholder(200, 200, 'Image', '#f3f4f6', '#9ca3af'),
  landscape: generateSVGPlaceholder(400, 300, 'Landscape', '#f3f4f6', '#9ca3af'),
  portrait: generateSVGPlaceholder(300, 400, 'Portrait', '#f3f4f6', '#9ca3af')
};

/**
 * Check if a URL is an external placeholder service
 * @param {string} url - Image URL to check
 * @returns {boolean} - True if it's an external placeholder service
 */
export const isExternalPlaceholder = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const externalServices = [
    'via.placeholder.com',        // Unreliable - blocks frequently
    'placeholder.com',
    'picsum.photos',
    'lorempixel.com',
    'dummyimage.com',
    'placehold.it',
    'fakeimg.pl',
    'placekitten.com',
    'placebear.com',
    'fillmurray.com'
    // Note: placehold.co is NOT in this list - it's more reliable
  ];
  
  return externalServices.some(service => url.includes(service));
};

/**
 * Get a reliable placeholder image URL
 * @param {string} type - Type of placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Custom text
 * @returns {string} - Reliable placeholder image URL
 */
export const getReliablePlaceholder = (type = 'product', width = 300, height = 300, text = null) => {
  // Use predefined placeholders if available
  if (PLACEHOLDER_IMAGES[type] && !text && width === 300 && height === 300) {
    return PLACEHOLDER_IMAGES[type];
  }
  
  // Generate custom placeholder
  const placeholderText = text || {
    product: 'Product Image',
    avatar: 'User',
    error: 'Image Error',
    loading: 'Loading...',
    noImage: 'No Image',
    thumbnail: 'Thumbnail',
    banner: 'Banner Image',
    square: 'Image',
    landscape: 'Landscape',
    portrait: 'Portrait'
  }[type] || 'No Image';
  
  return generateSVGPlaceholder(width, height, placeholderText);
};

/**
 * Replace external placeholder URLs with local ones
 * @param {string} url - Original image URL
 * @param {string} fallbackType - Type of fallback to use
 * @returns {string} - Safe image URL
 */
export const sanitizeImageUrl = (url, fallbackType = 'product') => {
  if (!url || isExternalPlaceholder(url)) {
    console.warn('Replacing external placeholder with local fallback:', url);
    return getReliablePlaceholder(fallbackType);
  }
  return url;
};

/**
 * Image error handler that provides local fallback
 * @param {Event} event - Error event
 * @param {string} fallbackType - Type of fallback
 * @returns {string} - Fallback image URL
 */
export const handleImageError = (event, fallbackType = 'error') => {
  const img = event.target;
  const originalSrc = img.src;
  
  console.warn('Image failed to load:', originalSrc);
  
  // Avoid infinite error loops
  if (!originalSrc.startsWith('data:image/svg+xml')) {
    const fallbackUrl = getReliablePlaceholder(fallbackType);
    img.src = fallbackUrl;
    return fallbackUrl;
  }
  
  return originalSrc;
};

/**
 * Preload images with fallback handling
 * @param {string[]} urls - Array of image URLs to preload
 * @param {function} onProgress - Progress callback
 * @returns {Promise} - Promise that resolves when all images are processed
 */
export const preloadImagesWithFallback = (urls, onProgress = null) => {
  return Promise.allSettled(
    urls.map((url, index) => {
      return new Promise((resolve, reject) => {
        // Skip external placeholders
        if (isExternalPlaceholder(url)) {
          const fallback = getReliablePlaceholder('product');
          if (onProgress) onProgress(index + 1, urls.length, 'skipped', url);
          resolve({ url, status: 'skipped', fallback });
          return;
        }
        
        const img = new Image();
        
        img.onload = () => {
          if (onProgress) onProgress(index + 1, urls.length, 'loaded', url);
          resolve({ url, status: 'loaded' });
        };
        
        img.onerror = () => {
          const fallback = getReliablePlaceholder('error');
          if (onProgress) onProgress(index + 1, urls.length, 'error', url);
          resolve({ url, status: 'error', fallback });
        };
        
        img.src = url;
      });
    })
  );
};

/**
 * Create a responsive image srcset with fallbacks
 * @param {string} baseUrl - Base image URL
 * @param {number[]} sizes - Array of sizes for srcset
 * @param {string} fallbackType - Fallback type
 * @returns {string} - Srcset string
 */
export const createResponsiveSrcSet = (baseUrl, sizes = [300, 600, 900], fallbackType = 'product') => {
  if (!baseUrl || isExternalPlaceholder(baseUrl)) {
    // Create fallback srcset with local placeholders
    return sizes.map(size => `${getReliablePlaceholder(fallbackType, size, size)} ${size}w`).join(', ');
  }
  
  // For valid URLs, create srcset (assuming the backend supports size parameters)
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Hook for managing image fallbacks in React components
 */
export const useImageFallback = (src, fallbackType = 'product') => {
  const [imageSrc, setImageSrc] = useState(sanitizeImageUrl(src, fallbackType));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setImageSrc(sanitizeImageUrl(src, fallbackType));
    setHasError(false);
    setIsLoading(true);
  }, [src, fallbackType]);
  
  const handleError = (event) => {
    if (!hasError) {
      setHasError(true);
      const fallbackUrl = handleImageError(event, fallbackType);
      setImageSrc(fallbackUrl);
    }
    setIsLoading(false);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  return {
    imageSrc,
    hasError,
    isLoading,
    handleError,
    handleLoad
  };
};

export default {
  generateSVGPlaceholder,
  generateCanvasPlaceholder,
  PLACEHOLDER_IMAGES,
  isExternalPlaceholder,
  getReliablePlaceholder,
  sanitizeImageUrl,
  handleImageError,
  preloadImagesWithFallback,
  createResponsiveSrcSet,
  useImageFallback
};
