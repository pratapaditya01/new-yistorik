import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  multiple = true,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (multiple) {
        validFiles.forEach(file => {
          formData.append('images', file);
        });
        
        const response = await api.post('/upload/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const newImages = response.images.map(img => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.originalName,
          isMain: images.length === 0 && img === response.images[0]
        }));

        onImagesChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      } else {
        formData.append('image', validFiles[0]);
        
        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const newImage = {
          url: response.image.url,
          publicId: response.image.publicId,
          alt: response.image.originalName,
          isMain: true
        };

        onImagesChange([newImage]);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image(s)';

      // Check if it's a Cloudinary configuration error
      if (errorMessage.includes('cloudinary') || errorMessage.includes('credentials')) {
        toast.error('Cloudinary not configured. Please set up your Cloudinary credentials in backend/.env');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = images[index];
    
    try {
      // Delete from Cloudinary
      if (imageToRemove.publicId) {
        await api.delete(`/upload/image/${encodeURIComponent(imageToRemove.publicId)}`);
      }
      
      const newImages = images.filter((_, i) => i !== index);
      
      // If we removed the main image, make the first remaining image main
      if (imageToRemove.isMain && newImages.length > 0) {
        newImages[0].isMain = true;
      }
      
      onImagesChange(newImages);
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleSetMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    onImagesChange(newImages);
    toast.success('Main image updated');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <CloudArrowUpIcon className="h-12 w-12 text-primary-500 animate-pulse" />
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <PhotoIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-primary-600 cursor-pointer">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP up to 5MB {multiple && `(max ${maxImages} images)`}
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                {multiple && !image.isMain && (
                  <button
                    onClick={() => handleSetMainImage(index)}
                    className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                    title="Set as main image"
                  >
                    Main
                  </button>
                )}
                
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  title="Remove image"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Main Image Badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Limit Warning */}
      {images.length >= maxImages && (
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span className="text-sm">
            Maximum number of images ({maxImages}) reached. Remove an image to upload more.
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
