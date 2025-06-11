/**
 * Reliable Image Component
 * Image component that never fails and doesn't depend on external services
 */

import React, { useState, useEffect } from 'react';
import { useImageFallback, sanitizeImageUrl, handleImageError } from '../../utils/imageFallback';
import PlaceholderImage from './PlaceholderImage';

/**
 * Main reliable image component
 */
const ReliableImage = ({
  src,
  alt = 'Image',
  width,
  height,
  className = '',
  fallbackType = 'product',
  onError,
  onLoad,
  showLoadingState = true,
  ...props
}) => {
  const { imageSrc, hasError, isLoading, handleError, handleLoad } = useImageFallback(src, fallbackType);

  const handleImageError = (event) => {
    handleError(event);
    if (onError) onError(event);
  };

  const handleImageLoad = (event) => {
    handleLoad();
    if (onLoad) onLoad(event);
  };

  // Show loading state
  if (isLoading && showLoadingState && imageSrc && !imageSrc.startsWith('data:')) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}
        style={{ width, height }}
        {...props}
      >
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
};

/**
 * Product image component with reliable fallbacks
 */
export const ReliableProductImage = ({
  src,
  alt = 'Product Image',
  className = '',
  size = 'md',
  aspectRatio = 'square',
  showLoadingState = true,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
    '2xl': 'w-80 h-80'
  };

  const aspectClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[2/3]'
  };

  return (
    <div className={`${sizeClasses[size]} ${aspectClasses[aspectRatio]} ${className}`}>
      <ReliableImage
        src={src}
        alt={alt}
        fallbackType="product"
        className="w-full h-full object-cover rounded-lg"
        showLoadingState={showLoadingState}
        {...props}
      />
    </div>
  );
};

/**
 * Avatar image component with reliable fallbacks
 */
export const ReliableAvatarImage = ({
  src,
  alt = 'Avatar',
  name = 'User',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
    '2xl': 'w-32 h-32 text-xl'
  };

  const [imageError, setImageError] = useState(false);

  // Generate initials for fallback
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleError = () => {
    setImageError(true);
  };

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Show initials fallback if no src or error
  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-primary-100 text-primary-600 font-medium rounded-full ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <ReliableImage
        src={src}
        alt={alt}
        fallbackType="avatar"
        className="w-full h-full object-cover rounded-full"
        onError={handleError}
        showLoadingState={false}
        {...props}
      />
    </div>
  );
};

/**
 * Gallery image component for image carousels
 */
export const ReliableGalleryImage = ({
  src,
  alt = 'Gallery Image',
  className = '',
  aspectRatio = 'landscape',
  showLoadingState = true,
  ...props
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[2/3]',
    ultrawide: 'aspect-[21/9]'
  };

  return (
    <div className={`w-full ${aspectClasses[aspectRatio]} ${className}`}>
      <ReliableImage
        src={src}
        alt={alt}
        fallbackType="product"
        className="w-full h-full object-cover"
        showLoadingState={showLoadingState}
        {...props}
      />
    </div>
  );
};

/**
 * Thumbnail image component
 */
export const ReliableThumbnail = ({
  src,
  alt = 'Thumbnail',
  className = '',
  size = 'sm',
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <ReliableImage
        src={src}
        alt={alt}
        fallbackType="thumbnail"
        className="w-full h-full object-cover rounded"
        showLoadingState={false}
        {...props}
      />
    </div>
  );
};

/**
 * Banner/Hero image component
 */
export const ReliableBannerImage = ({
  src,
  alt = 'Banner Image',
  className = '',
  height = 'h-64',
  ...props
}) => {
  return (
    <div className={`w-full ${height} ${className}`}>
      <ReliableImage
        src={src}
        alt={alt}
        fallbackType="banner"
        className="w-full h-full object-cover"
        showLoadingState={true}
        {...props}
      />
    </div>
  );
};

/**
 * Hook for managing multiple images with fallbacks
 */
export const useReliableImages = (imageUrls, fallbackType = 'product') => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors([]);

    const processedImages = imageUrls.map((url, index) => ({
      id: index,
      originalUrl: url,
      safeUrl: sanitizeImageUrl(url, fallbackType),
      hasError: false,
      isLoaded: false
    }));

    setImages(processedImages);
    setLoading(false);
  }, [imageUrls, fallbackType]);

  const handleImageError = (imageId, event) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, hasError: true, safeUrl: handleImageError(event, fallbackType) }
        : img
    ));
    
    setErrors(prev => [...prev, imageId]);
  };

  const handleImageLoad = (imageId) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isLoaded: true }
        : img
    ));
  };

  return {
    images,
    loading,
    errors,
    handleImageError,
    handleImageLoad
  };
};

/**
 * Image grid component with reliable fallbacks
 */
export const ReliableImageGrid = ({
  images = [],
  className = '',
  imageClassName = '',
  cols = 3,
  aspectRatio = 'square',
  fallbackType = 'product',
  ...props
}) => {
  const { images: processedImages, handleImageError, handleImageLoad } = useReliableImages(images, fallbackType);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[cols]} gap-4 ${className}`} {...props}>
      {processedImages.map((image, index) => (
        <ReliableGalleryImage
          key={image.id}
          src={image.safeUrl}
          alt={`Image ${index + 1}`}
          className={imageClassName}
          aspectRatio={aspectRatio}
          onError={(event) => handleImageError(image.id, event)}
          onLoad={() => handleImageLoad(image.id)}
        />
      ))}
    </div>
  );
};

export default ReliableImage;
