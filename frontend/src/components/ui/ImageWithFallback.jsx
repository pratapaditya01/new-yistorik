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
  const shouldShowPlaceholder = !src ||
    imageError ||
    src.includes('via.placeholder.com') ||
    src.includes('placeholder.com') ||
    src.includes('picsum.photos') ||
    src.includes('lorempixel.com') ||
    src.startsWith('/placeholder') ||
    src === 'placeholder' ||
    src === 'no-image';

  if (shouldShowPlaceholder) {
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
