import React from 'react';
import PlaceholderImage, { AspectPlaceholderImage, ProductPlaceholder, AvatarPlaceholder } from '../components/ui/PlaceholderImage';
import ImageWithFallback, { ProductImage, AvatarImage } from '../components/ui/ImageWithFallback';
import { getPlaceholderUrl } from '../utils/imageUtils';

/**
 * Demo page to test all placeholder image components
 * This page can be accessed at /placeholder-demo for testing
 */
const PlaceholderDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Placeholder Image Components Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testing all placeholder image components and fallback behaviors
          </p>
        </div>

        {/* Basic Placeholder Images */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Placeholder Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Default Placeholder</h3>
              <PlaceholderImage 
                width={250} 
                height={200} 
                text="Default Image"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
              <PlaceholderImage 
                width={250} 
                height={200} 
                text="Custom Style"
                bgColor="bg-blue-100"
                textColor="text-blue-600"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">No Icon</h3>
              <PlaceholderImage 
                width={250} 
                height={200} 
                text="Text Only"
                showIcon={false}
              />
            </div>
          </div>
        </section>

        {/* Aspect Ratio Placeholders */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aspect Ratio Placeholders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Square (1:1)</h3>
              <AspectPlaceholderImage 
                aspectRatio="1:1"
                text="Square Image"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Video (16:9)</h3>
              <AspectPlaceholderImage 
                aspectRatio="16:9"
                text="Video Thumbnail"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Portrait (2:3)</h3>
              <AspectPlaceholderImage 
                aspectRatio="2:3"
                text="Portrait Image"
              />
            </div>
          </div>
        </section>

        {/* Product Placeholders */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Placeholders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Small</h3>
              <ProductPlaceholder size="sm" className="mx-auto" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Medium</h3>
              <ProductPlaceholder size="md" className="mx-auto" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Large</h3>
              <ProductPlaceholder size="lg" className="mx-auto" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Extra Large</h3>
              <ProductPlaceholder size="xl" className="mx-auto" />
            </div>
          </div>
        </section>

        {/* Avatar Placeholders */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avatar Placeholders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Small</h3>
              <AvatarPlaceholder name="John Doe" size="sm" className="mx-auto" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Medium</h3>
              <AvatarPlaceholder name="Jane Smith" size="md" className="mx-auto" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Large</h3>
              <AvatarPlaceholder name="Mike Johnson" size="lg" className="mx-auto" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Extra Large</h3>
              <AvatarPlaceholder name="Sarah Wilson" size="xl" className="mx-auto" />
            </div>
          </div>
        </section>

        {/* Image with Fallback */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Images with Fallback</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Broken Image URL</h3>
              <ImageWithFallback
                src="https://broken-url.com/image.jpg"
                alt="Broken Image"
                width={250}
                height={200}
                fallbackType="product"
                className="w-full"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">No Image Source</h3>
              <ImageWithFallback
                src=""
                alt="No Source"
                width={250}
                height={200}
                placeholderText="No Image Available"
                className="w-full"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Placehold.co (Reliable)</h3>
              <ImageWithFallback
                src="https://placehold.co/300x200?text=Reliable+Service"
                alt="Reliable Placeholder"
                width={250}
                height={200}
                placeholderText="Reliable External"
                className="w-full"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Via Placeholder (Blocked)</h3>
              <ImageWithFallback
                src="https://placehold.co/300x200"
                alt="Blocked Placeholder"
                width={250}
                height={200}
                placeholderText="External Blocked"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Product Images */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Image Components</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Small Product</h3>
              <ProductImage 
                src="https://broken-url.com/product.jpg"
                alt="Product"
                size="sm"
                className="mx-auto"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Medium Product</h3>
              <ProductImage 
                src=""
                alt="Product"
                size="md"
                className="mx-auto"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Large Product (Reliable)</h3>
              <ProductImage
                src="https://placehold.co/400x400?text=Product+Image"
                alt="Product"
                size="lg"
                className="mx-auto"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">XL Product</h3>
              <ProductImage 
                src="/uploads/nonexistent.jpg"
                alt="Product"
                size="xl"
                className="mx-auto"
              />
            </div>
          </div>
        </section>

        {/* Avatar Images */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avatar Image Components</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Small Avatar</h3>
              <AvatarImage 
                src="https://broken-url.com/avatar.jpg"
                alt="User Avatar"
                name="John Doe"
                size="sm"
                className="mx-auto"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Medium Avatar</h3>
              <AvatarImage 
                src=""
                alt="User Avatar"
                name="Jane Smith"
                size="md"
                className="mx-auto"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">Large Avatar (Reliable)</h3>
              <AvatarImage
                src="https://placehold.co/100x100?text=MJ"
                alt="User Avatar"
                name="Mike Johnson"
                size="lg"
                className="mx-auto"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-4">XL Avatar</h3>
              <AvatarImage 
                src="/uploads/nonexistent-avatar.jpg"
                alt="User Avatar"
                name="Sarah Wilson"
                size="xl"
                className="mx-auto"
              />
            </div>
          </div>
        </section>

        {/* Utility Functions Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Utility Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Generated Placeholder</h3>
              <img 
                src={getPlaceholderUrl('product', 250, 200, 'Generated')}
                alt="Generated Placeholder"
                className="w-full rounded"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Error Placeholder</h3>
              <img 
                src={getPlaceholderUrl('error', 250, 200, 'Error State')}
                alt="Error Placeholder"
                className="w-full rounded"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Custom Size</h3>
              <img 
                src={getPlaceholderUrl('default', 250, 150, 'Custom Size')}
                alt="Custom Placeholder"
                className="w-full rounded"
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About These Placeholders</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              These placeholder images are generated locally using SVG and provide reliable fallbacks.
              When external services are needed, we use reliable services like placehold.co instead of
              problematic ones like placehold.co. This ensures they work even when:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>External placeholder services are blocked or unavailable</li>
              <li>Working offline or in restricted network environments</li>
              <li>Need consistent styling across the application</li>
              <li>Want to avoid external dependencies</li>
              <li>Require more reliable external placeholder services</li>
            </ul>
            <p className="text-gray-600">
              All components include proper fallback handling and can be customized with different sizes, 
              colors, and text content.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlaceholderDemo;
