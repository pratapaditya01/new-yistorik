import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getImageUrl } from '../utils/imageUtils';
import { formatPrice, formatPriceRange } from '../utils/currency';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { debugGSTFlow } from '../utils/gstFlowDebug';
import { debugSizeFlow } from '../utils/sizeFlowDebug';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Sample product data (replace with API call)
  const sampleProduct = {
    _id: '1',
    name: 'Classic White T-Shirt',
    slug: 'classic-white-t-shirt',
    price: 29.99,
    comparePrice: 39.99,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'White T-Shirt Front' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'White T-Shirt Back' },
      { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'White T-Shirt Detail' },
    ],
    category: { name: 'T-Shirts', slug: 't-shirts' },
    averageRating: 4.5,
    numReviews: 128,
    inStock: true,
    stockQuantity: 50,
    shortDescription: 'Comfortable cotton t-shirt perfect for everyday wear',
    description: `
      <p>This classic white t-shirt is made from 100% premium cotton for ultimate comfort and durability.
      The relaxed fit makes it perfect for casual wear, while the high-quality fabric ensures it maintains
      its shape and color after multiple washes.</p>

      <h4>Features:</h4>
      <ul>
        <li>100% Premium Cotton</li>
        <li>Pre-shrunk fabric</li>
        <li>Reinforced seams</li>
        <li>Machine washable</li>
        <li>Available in multiple sizes</li>
      </ul>

      <h4>Care Instructions:</h4>
      <p>Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.</p>
    `,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', value: '#FFFFFF' },
      { name: 'Black', value: '#000000' },
      { name: 'Gray', value: '#6B7280' },
      { name: 'Navy', value: '#1E3A8A' },
    ],
    specifications: {
      'Material': '100% Cotton',
      'Fit': 'Regular',
      'Sleeve Length': 'Short',
      'Neckline': 'Crew Neck',
      'Care': 'Machine Wash',
      'Origin': 'Made in USA',
    },
  };

  const sampleReviews = [
    {
      _id: '1',
      user: { name: 'Sarah Johnson', avatar: null },
      rating: 5,
      title: 'Perfect fit and quality!',
      comment: 'This t-shirt exceeded my expectations. The fabric is soft and comfortable, and the fit is exactly what I was looking for.',
      date: '2024-01-15',
      verified: true,
    },
    {
      _id: '2',
      user: { name: 'Mike Chen', avatar: null },
      rating: 4,
      title: 'Great basic tee',
      comment: 'Good quality cotton t-shirt. Washes well and maintains its shape. Would recommend for everyday wear.',
      date: '2024-01-10',
      verified: true,
    },
    {
      _id: '3',
      user: { name: 'Emily Davis', avatar: null },
      rating: 5,
      title: 'Love the softness',
      comment: 'Super soft and comfortable. I ordered multiple colors because I love this t-shirt so much!',
      date: '2024-01-05',
      verified: false,
    },
  ];

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRelatedProducts();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with slug:', slug);

      // Fetch product from API
      const response = await productService.getProduct(slug);
      console.log('Product response:', response);

      if (response) {
        setProduct(response);

        // Debug GST data from API
        console.log('📦 PRODUCT DETAIL - Product fetched:', response);
        debugGSTFlow.debugProductAPI(response);

        // Debug size data from API
        debugSizeFlow.debugProductSizes(response);

        // Set default variants if available
        // Set default variants if available
        if (response.variants && response.variants.length > 0) {
          const colorVariant = response.variants.find(v => v.name.toLowerCase() === 'color');
          const sizeVariant = response.variants.find(v => v.name.toLowerCase() === 'size');

          if (colorVariant && colorVariant.options.length > 0) {
            setSelectedColor(colorVariant.options[0]);
          }
          if (sizeVariant && sizeVariant.options.length > 0) {
            setSelectedSize(sizeVariant.options[0]);
          }
        }

        // For products without variants, set empty defaults
        if (!response.variants || response.variants.length === 0) {
          setSelectedColor('');
          setSelectedSize('');
        }
      } else {
        console.error('Product not found');
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      // Simulate API call - replace with actual API
      setReviews(sampleReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      // Simulate API call - replace with actual API
      setRelatedProducts([]);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    // Check if variants are required
    const hasColorVariant = product.variants && product.variants.find(v => v.name.toLowerCase() === 'color');
    const hasSizeVariant = product.variants && product.variants.find(v => v.name.toLowerCase() === 'size');

    if (hasColorVariant && !selectedColor) {
      alert('Please select a color');
      return;
    }

    if (hasSizeVariant && !selectedSize) {
      alert('Please select a size');
      return;
    }

    // Prepare selected variants
    const selectedVariants = [];
    if (selectedColor) {
      selectedVariants.push({ name: 'Color', value: selectedColor });
    }
    if (selectedSize) {
      selectedVariants.push({ name: 'Size', value: selectedSize });
    }

    // Debug add to cart with size
    console.log('🛒 ADD TO CART - Adding product with variants:');
    const addToCartValid = debugSizeFlow.debugAddToCartWithSize(product, selectedSize, quantity, selectedVariants);

    if (addToCartValid) {
      // Add to cart with product object, quantity, and variants
      addToCart(product, quantity, selectedVariants);
    } else {
      console.error('❌ Add to cart failed validation');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary btn-md">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category._id}`} className="hover:text-primary-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src={getImageUrl(product.images[selectedImage]?.url)}
                alt={product.images[selectedImage]?.alt || product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </>
              )}

              {/* Sale Badge */}
              {product.comparePrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sale
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.url)}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {renderStars(product.averageRating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.averageRating} ({product.numReviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-600">
                  SKU: {product.sku || product._id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      Save {formatPrice(product.comparePrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* GST Information - Only show if GST > 0% */}
              {product.gstRate > 0 && (
                <div className="text-sm text-gray-600">
                  <span>GST: {product.gstRate}% </span>
                  {product.gstInclusive ? (
                    <span className="text-green-600">(Inclusive)</span>
                  ) : (
                    <span className="text-orange-600">(Exclusive - ₹{((product.price * product.gstRate) / 100).toFixed(2)} additional)</span>
                  )}
                </div>
              )}

              {/* GST Exempt Notice - Show for 0% GST */}
              {(product.gstRate === 0 || product.gstRate === null || product.gstRate === undefined) && (
                <div className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  ✅ GST Exempt Product
                </div>
              )}

              {/* Debug GST Info */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: GST Rate = {product.gstRate}, Type: {typeof product.gstRate}
              </div>
            </div>

            {/* Short Description */}
            <p className="text-gray-600 text-lg">{product.shortDescription}</p>

            {/* Color Selection */}
            {product.variants && product.variants.find(v => v.name.toLowerCase() === 'color') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color: <span className="font-normal">{selectedColor}</span>
                </label>
                <div className="flex space-x-3">
                  {product.variants.find(v => v.name.toLowerCase() === 'color').options.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium transition-all ${
                        selectedColor === color
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                      title={color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.variants && product.variants.find(v => v.name.toLowerCase() === 'size') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Size: <span className="font-normal">{selectedSize}</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {product.variants.find(v => v.name.toLowerCase() === 'size').options.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        console.log('👤 SIZE SELECTION - Size selected:', size);
                        debugSizeFlow.debugSizeSelection(size, product.sizes, product);
                      }}
                      className={`py-2 px-3 border rounded-md text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${(product.isActive && product.quantity > 0) ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${(product.isActive && product.quantity > 0) ? 'text-green-700' : 'text-red-700'}`}>
                {(product.isActive && product.quantity > 0) ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!(product.isActive && product.quantity > 0)}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {(product.isActive && product.quantity > 0) ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                <HeartIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <TruckIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over ₹499</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">1-Day Returns</p>
                    <p className="text-xs text-gray-600">Easy returns policy</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StarIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quality Guarantee</p>
                    <p className="text-xs text-gray-600">Premium materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                  {tab === 'reviews' && ` (${reviews.length})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>No detailed description available for this product.</p>
                  )}
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications && product.specifications.length > 0 ? (
                  product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">{spec.name}:</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No specifications available for this product.
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Reviews Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    <button className="btn-primary btn-sm">Write a Review</button>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{product.averageRating}</div>
                      <div className="flex items-center justify-center mt-1">
                        {renderStars(product.averageRating)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Based on {product.numReviews} reviews
                      </div>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                        return (
                          <div key={rating} className="flex items-center space-x-3 mb-2">
                            <span className="text-sm text-gray-600 w-8">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {review.user.name.charAt(0)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                {review.verified && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>

                          <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Reviews */}
                {reviews.length > 0 && (
                  <div className="text-center">
                    <button className="btn-outline btn-md">Load More Reviews</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
