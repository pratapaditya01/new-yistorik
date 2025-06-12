import React, { useState, useEffect } from 'react';
import { debugProductImages, monitorPageImages, checkImageBlocking } from '../../utils/debugImages';

/**
 * Debug component to help identify image loading issues
 * Add this temporarily to pages where images aren't loading
 */
const ImageDebugger = ({ products = [] }) => {
  const [debugResults, setDebugResults] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Auto-run basic checks when component mounts
    checkImageBlocking();
    monitorPageImages();
  }, []);

  const runProductImageDebug = async () => {
    if (products.length === 0) {
      console.warn('No products provided for debugging');
      return;
    }

    const results = [];
    for (const product of products.slice(0, 3)) { // Debug first 3 products
      await debugProductImages(product);
      results.push({
        productName: product.name,
        imageCount: product.images?.length || 0,
        images: product.images || []
      });
    }
    setDebugResults(results);
  };

  const runPageImageCheck = () => {
    monitorPageImages();
  };

  const runBlockingCheck = () => {
    checkImageBlocking();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-red-600"
        >
          🐛 Debug Images
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Image Debugger</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={runProductImageDebug}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Debug Product Images
        </button>
        
        <button
          onClick={runPageImageCheck}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
        >
          Check Page Images
        </button>
        
        <button
          onClick={runBlockingCheck}
          className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
        >
          Check Image Blocking
        </button>
      </div>

      {debugResults.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <h4 className="font-semibold mb-2">Debug Results:</h4>
          {debugResults.map((result, index) => (
            <div key={index} className="mb-2">
              <strong>{result.productName}</strong>: {result.imageCount} images
              {result.images.map((img, imgIndex) => (
                <div key={imgIndex} className="ml-2 text-gray-600">
                  • {img.url} {img.isMain ? '(main)' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default ImageDebugger;
