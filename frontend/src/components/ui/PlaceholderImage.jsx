import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

/**
 * Local placeholder image component that doesn't rely on external services
 */
const PlaceholderImage = ({ 
  width = 300, 
  height = 300, 
  text = 'No Image', 
  className = '',
  bgColor = 'bg-gray-100',
  textColor = 'text-gray-400',
  showIcon = true 
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center ${bgColor} ${textColor} ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      {showIcon && (
        <PhotoIcon className="w-8 h-8 mb-2" />
      )}
      <span className="text-sm font-medium text-center px-2">
        {text}
      </span>
    </div>
  );
};

/**
 * Placeholder image with aspect ratio support
 */
export const AspectPlaceholderImage = ({ 
  aspectRatio = '1:1', 
  text = 'No Image',
  className = '',
  bgColor = 'bg-gray-100',
  textColor = 'text-gray-400',
  showIcon = true 
}) => {
  const getAspectClass = (ratio) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      case '1:1': return 'aspect-square';
      case '2:3': return 'aspect-[2/3]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className={`${getAspectClass(aspectRatio)} w-full ${className}`}>
      <div className={`w-full h-full flex flex-col items-center justify-center ${bgColor} ${textColor}`}>
        {showIcon && (
          <PhotoIcon className="w-8 h-8 mb-2" />
        )}
        <span className="text-sm font-medium text-center px-2">
          {text}
        </span>
      </div>
    </div>
  );
};

/**
 * Product placeholder specifically for product images
 */
export const ProductPlaceholder = ({ 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  return (
    <div className={`${sizeClasses[size]} flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg ${className}`}>
      <PhotoIcon className="w-8 h-8 text-gray-300 mb-1" />
      <span className="text-xs text-gray-400 text-center px-1">
        Product Image
      </span>
    </div>
  );
};

/**
 * Avatar placeholder for user profiles
 */
export const AvatarPlaceholder = ({ 
  name = 'User',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-primary-100 text-primary-600 font-medium rounded-full ${className}`}>
      {initials}
    </div>
  );
};

/**
 * Generate a data URL for a simple placeholder image
 */
export const generatePlaceholderDataURL = (width = 300, height = 300, text = 'No Image', bgColor = '#f3f4f6', textColor = '#9ca3af') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.max(12, width / 20)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

/**
 * Hook to generate placeholder images
 */
export const usePlaceholderImage = () => {
  const createPlaceholder = (width = 300, height = 300, text = 'No Image') => {
    return generatePlaceholderDataURL(width, height, text);
  };

  return { createPlaceholder };
};

export default PlaceholderImage;
