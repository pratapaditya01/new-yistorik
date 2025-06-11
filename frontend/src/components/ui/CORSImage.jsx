import React, { useState, useEffect, useRef } from 'react';
import ImageWithFallback from './ImageWithFallback';

/**
 * Image component that handles CORS and CORB issues
 */
const CORSImage = ({
  src,
  alt = 'Image',
  className = '',
  fallbackType = 'product',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  // Function to handle CORS/CORB issues
  const handleImageLoad = async (imageUrl) => {
    if (!imageUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Avoid loading external placeholder services that might be blocked
    const isExternalPlaceholder = imageUrl.includes('via.placeholder.com') ||
      imageUrl.includes('placeholder.com') ||
      imageUrl.includes('picsum.photos') ||
      imageUrl.includes('lorempixel.com') ||
      imageUrl.includes('dummyimage.com');

    if (isExternalPlaceholder) {
      console.warn('Avoiding external placeholder service:', imageUrl);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      // For backend images, try to load with proper headers
      if (imageUrl.includes('new-yistorik.onrender.com')) {
        // Create a new image element to test loading
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous'; // Enable CORS
        
        testImg.onload = () => {
          setImageSrc(imageUrl);
          setHasError(false);
          setIsLoading(false);
          if (onLoad) onLoad();
        };
        
        testImg.onerror = () => {
          console.warn('CORS image load failed, trying without CORS:', imageUrl);
          // Try without CORS
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setImageSrc(imageUrl);
            setHasError(false);
            setIsLoading(false);
            if (onLoad) onLoad();
          };
          fallbackImg.onerror = () => {
            console.error('Image load failed completely:', imageUrl);
            setHasError(true);
            setIsLoading(false);
            if (onError) onError();
          };
          fallbackImg.src = imageUrl;
        };
        
        testImg.src = imageUrl;
      } else {
        // For other images, load normally
        const img = new Image();
        img.onload = () => {
          setImageSrc(imageUrl);
          setHasError(false);
          setIsLoading(false);
          if (onLoad) onLoad();
        };
        img.onerror = () => {
          setHasError(true);
          setIsLoading(false);
          if (onError) onError();
        };
        img.src = imageUrl;
      }
    } catch (error) {
      console.error('Error loading image:', error);
      setHasError(true);
      setIsLoading(false);
      if (onError) onError(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    handleImageLoad(src);
  }, [src]);

  // If there's an error or no src, use fallback
  if (hasError || !src) {
    return (
      <ImageWithFallback
        src=""
        alt={alt}
        className={className}
        fallbackType={fallbackType}
        {...props}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} {...props}>
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Render the actual image
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => {
        setIsLoading(false);
        if (onLoad) onLoad();
      }}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
        if (onError) onError();
      }}
      {...props}
    />
  );
};

/**
 * Product image component with CORS handling
 */
export const CORSProductImage = ({
  src,
  alt = 'Product Image',
  className = '',
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <CORSImage
        src={src}
        alt={alt}
        fallbackType="product"
        className="w-full h-full object-cover rounded-lg"
        {...props}
      />
    </div>
  );
};

/**
 * Hook to preload images with CORS handling
 */
export const useImagePreloader = (imageUrls) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        
        // Try with CORS first for backend images
        if (url.includes('new-yistorik.onrender.com')) {
          img.crossOrigin = 'anonymous';
        }
        
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]));
          resolve(true);
        };
        
        img.onerror = () => {
          // Try without CORS
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setLoadedImages(prev => new Set([...prev, url]));
            resolve(true);
          };
          fallbackImg.onerror = () => {
            setFailedImages(prev => new Set([...prev, url]));
            resolve(false);
          };
          fallbackImg.src = url;
        };
        
        img.src = url;
      });
    };

    // Preload all images
    Promise.all(imageUrls.map(preloadImage));
  }, [imageUrls]);

  return { loadedImages, failedImages };
};

export default CORSImage;
