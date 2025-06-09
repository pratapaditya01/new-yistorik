import React, { memo } from 'react';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const LoadingSpinner = memo(({ size = 'md', className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
