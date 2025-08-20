/**
 * Image Fallback Test Page
 * Demonstrates the reliable image fallback system
 */

import React, { useState } from 'react';
import ReliableImage, { 
  ReliableProductImage, 
  ReliableAvatarImage, 
  ReliableGalleryImage,
  ReliableThumbnail,
  ReliableBannerImage,
  ReliableImageGrid
} from '../components/ui/ReliableImage';
import { PLACEHOLDER_IMAGES, isExternalPlaceholder, sanitizeImageUrl } from '../utils/imageFallback';

const ImageFallbackTest = () => {
  const [testResults, setTestResults] = useState([]);

  // Test URLs including problematic ones
  const testUrls = [
    'https://placehold.co/300x300?text=Reliable+Service',              // This should work (reliable)
    'https://placehold.co/300x300/f3f4f6/9ca3af?text=No+Image',        // This should work (reliable)
    'https://picsum.photos/300/300',                                   // This should be blocked
    'https://broken-url.com/image.jpg',                                // This should fail
    'https://31.97.235.37/uploads/sample-product.jpg',    // This might work
    '',                                                                // Empty URL
    null,                                                              // Null URL
    'placeholder',                                                     // Invalid URL
    '/uploads/valid-image.jpg'                                         // Relative URL
  ];

  const runImageTests = () => {
    const results = testUrls.map((url, index) => {
      const isExternal = isExternalPlaceholder(url);
      const sanitized = sanitizeImageUrl(url, 'product');
      
      return {
        id: index,
        originalUrl: url,
        isExternalPlaceholder: isExternal,
        sanitizedUrl: sanitized,
        shouldBlock: isExternal,
        status: isExternal ? 'blocked' : 'allowed'
      };
    });
    
    setTestResults(results);
    console.table(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Fallback System Test
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Testing reliable image loading without external dependencies. 
            All images below use local fallbacks and never fail to load.
          </p>
          <button
            onClick={runImageTests}
            className="mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Run Image URL Tests
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">URL Test Results</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action Taken
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testResults.map((result) => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.originalUrl || 'null/empty'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.status === 'blocked' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {result.isExternalPlaceholder 
                            ? 'Replaced with local fallback' 
                            : 'Allowed to load (with fallback on error)'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* URL Comparison Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Placeholder Service Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-green-600">placehold.co (Reliable)</h3>
              <ReliableImage
                src="https://placehold.co/300x300?text=Reliable+Service"
                alt="Placehold.co"
                className="w-full h-48 object-cover rounded"
                fallbackType="product"
              />
              <p className="text-sm text-gray-600 mt-2">
                This service is more reliable and works consistently.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-green-600">placehold.co (Reliable)</h3>
              <ReliableImage
                src="https://placehold.co/300x300/f3f4f6/9ca3af?text=No+Image"
                alt="Placehold.co Placeholder"
                className="w-full h-48 object-cover rounded"
                fallbackType="product"
              />
              <p className="text-sm text-gray-600 mt-2">
                This reliable external service works consistently and is preferred over placehold.co.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Broken URL</h3>
              <ReliableImage
                src="https://broken-url-that-does-not-exist.com/image.jpg"
                alt="Broken URL"
                className="w-full h-48 object-cover rounded"
                fallbackType="error"
              />
              <p className="text-sm text-gray-600 mt-2">
                Broken URLs automatically fall back to local placeholders.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Empty/Null URL</h3>
              <ReliableImage
                src=""
                alt="Empty URL"
                className="w-full h-48 object-cover rounded"
                fallbackType="product"
              />
              <p className="text-sm text-gray-600 mt-2">
                Empty or null URLs show appropriate placeholders immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Product Images Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Image Components</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Small</h3>
              <ReliableProductImage 
                src="https://broken-url.com/product.jpg"
                alt="Product"
                size="sm"
                className="mx-auto"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Medium</h3>
              <ReliableProductImage 
                src=""
                alt="Product"
                size="md"
                className="mx-auto"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Large</h3>
              <ReliableProductImage 
                src="https://placehold.co/300x300"
                alt="Product"
                size="lg"
                className="mx-auto"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Extra Large</h3>
              <ReliableProductImage 
                src="https://picsum.photos/400/400"
                alt="Product"
                size="xl"
                className="mx-auto"
              />
            </div>
          </div>
        </section>

        {/* Avatar Images Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avatar Components</h2>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Broken URL</h3>
              <ReliableAvatarImage 
                src="https://broken-avatar.com/user.jpg"
                name="John Doe"
                size="lg"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Empty URL</h3>
              <ReliableAvatarImage 
                src=""
                name="Jane Smith"
                size="lg"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">External Placeholder</h3>
              <ReliableAvatarImage
                src="https://placehold.co/100x100?text=Avatar"
                name="Bob Wilson"
                size="lg"
              />
            </div>
          </div>
        </section>

        {/* Gallery Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Gallery</h2>
          <ReliableImageGrid
            images={[
              'https://placehold.co/400x300?text=Reliable+1',
              'https://placehold.co/400x300',  // This will be blocked
              'https://broken-url.com/image1.jpg',
              '',
              'https://picsum.photos/400/300',
              null,
              'https://lorempixel.com/400/300'
            ]}
            cols={3}
            aspectRatio="landscape"
            className="mb-6"
          />
        </section>

        {/* Banner Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Banner Image</h2>
          <ReliableBannerImage
            src="https://placehold.co/1200x400?text=Reliable+Banner+Image"
            alt="Banner"
            height="h-48"
            className="rounded-lg"
          />
        </section>

        {/* Info Section */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              The reliable image system automatically handles problematic image URLs:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong>Unreliable External Services:</strong> URLs from placehold.co, picsum.photos, etc. are blocked and replaced with local SVG placeholders</li>
              <li><strong>Reliable External Services:</strong> Services like placehold.co are allowed as they're more dependable</li>
              <li><strong>Broken URLs:</strong> Failed image loads automatically fall back to appropriate placeholders</li>
              <li><strong>Empty/Null URLs:</strong> Show placeholders immediately without attempting to load</li>
              <li><strong>Network Errors:</strong> Handle CORS issues and network failures gracefully</li>
              <li><strong>Loading States:</strong> Show loading indicators while images are being fetched</li>
            </ul>
            <p className="text-gray-600 mb-4">
              <strong>Benefits:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>No dependency on external placeholder services</li>
              <li>Works offline and in restricted network environments</li>
              <li>Consistent styling across the application</li>
              <li>Better performance (no external requests for placeholders)</li>
              <li>Improved user experience (no broken images)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ImageFallbackTest;
