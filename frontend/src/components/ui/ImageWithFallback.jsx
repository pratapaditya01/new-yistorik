import React, { useState, useEffect } from 'react';
import PlaceholderImage, { ProductPlaceholder } from './PlaceholderImage';

/**
 * Image component with automatic fallback to placeholder
 */
const ImageWithFallback = ({
  src,
  alt = 'Image',
  width,
  height,
  className = '',
  placeholderText = 'No Image',
  fallbackType = 'placeholder', // 'placeholder' | 'product' | 'custom'
  onError,
  onLoad,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  const handleImageError = (e) => {
    console.warn('Image failed to load:', src);
    setImageError(true);
    if (onError) {
      onError(e);
    }
  };

  const handleImageLoad = (e) => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  // Don't try to load if no src or src is a placeholder URL that might fail
  // Note: placehold.co is allowed as it's more reliable than placehold.co
  // Be more specific about what to block - only block actual placeholder services, not uploaded images
  const shouldShowPlaceholder = !src ||
    imageError ||
    src.includes('placehold.co') ||
    src.includes('picsum.photos') ||
    src.includes('lorempixel.com') ||
    src.includes('dummyimage.com') ||
    src.includes('placehold.it') ||
    src === 'placeholder' ||
    src === 'no-image' ||
    (src.startsWith('/placeholder') && !src.startsWith('/uploads/'));

  if (shouldShowPlaceholder) {
    // Debug logging to help identify why images are being blocked
    if (src && src !== 'placeholder' && src !== 'no-image') {
      console.log('ImageWithFallback: Showing placeholder for:', src, {
        noSrc: !src,
        imageError,
        isViaPlaceholder: src.includes('placehold.co'),
        isPicsum: src.includes('picsum.photos'),
        isLorempixel: src.includes('lorempixel.com'),
        isDummyimage: src.includes('dummyimage.com'),
        isPlaceholdIt: src.includes('placehold.it'),
        isPlaceholderPath: src.startsWith('/placeholder') && !src.startsWith('/uploads/')
      });
    }

    switch (fallbackType) {
      case 'product':
        return (
          <ProductPlaceholder 
            className={className}
            size={width && width < 100 ? 'sm' : 'md'}
          />
        );
      case 'custom':
        return (
          <div className={className} style={{ width, height }}>
            {props.customFallback}
          </div>
        );
      default:
        return (
          <PlaceholderImage
            width={width || 300}
            height={height || 300}
            text={placeholderText}
            className={className}
          />
        );
    }
  }

  return (
    <img
      src={src}
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
 * Product image component with specific styling
 */
export const ProductImage = ({
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
      <ImageWithFallback
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
 * Avatar image component
 */
export const AvatarImage = ({
  src,
  alt = 'Avatar',
  name = 'User',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <ImageWithFallback
        src={src}
        alt={alt}
        fallbackType="custom"
        customFallback={
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-medium rounded-full">
            {name.charAt(0).toUpperCase()}
          </div>
        }
        className="w-full h-full object-cover rounded-full"
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
