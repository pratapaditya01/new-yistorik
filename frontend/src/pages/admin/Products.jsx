import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import ImageUpload from '../../components/admin/ImageUpload';
import { getMainImageUrl } from '../../utils/imageUtils';
import { formatPrice } from '../../utils/currency';
import { getGSTSuggestion, validateGSTRate, calculateGST, formatGSTCalculation, getCommonGSTRates } from '../../utils/gstHelper';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');



  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, filterCategory, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: filterCategory,
        sortBy,
        sortOrder,
      };

      const data = await adminService.getAdminProducts(params);
      setProducts(data.products || data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminService.getAdminCategories();
      setCategories(data.categories || data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      setCategories([]);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category._id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your product catalog, inventory, and pricing
            </p>
          </div>
          <button
            onClick={() => openModal('create')}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stockQuantity">Stock</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Products ({filteredProducts.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first product'}
              </p>
              <button
                onClick={() => openModal('create')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={getMainImageUrl(product.images)}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(product.price)}
                          {product.comparePrice && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.quantity || product.stockQuantity || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (product.isActive !== undefined ? product.isActive : product.inStock)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(product.isActive !== undefined ? product.isActive : product.inStock) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal('view', product)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="View Product"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('edit', product)}
                            className="text-primary-600 hover:text-primary-900 p-1"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal
          type={modalType}
          product={selectedProduct}
          categories={categories}
          onClose={closeModal}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ type, product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    sku: '',
    category: '',
    stockQuantity: '',
    inStock: true,
    featured: false,
    images: [],
    // GST fields
    gstRate: 18,
    gstType: 'CGST_SGST',
    hsnCode: '',
    gstInclusive: false,
    taxable: true,
  });
  const [loading, setLoading] = useState(false);
  const [gstError, setGstError] = useState('');

  // Get common GST rates for quick buttons
  const commonGSTRates = getCommonGSTRates();

  useEffect(() => {
    if (product && (type === 'edit' || type === 'view')) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        sku: product.sku || '',
        category: product.category._id || product.category || '',
        stockQuantity: product.quantity || product.stockQuantity || '',
        inStock: product.isActive !== undefined ? product.isActive : (product.inStock || true),
        featured: product.isFeatured !== undefined ? product.isFeatured : (product.featured || false),
        images: product.images || [],
        // GST fields
        gstRate: product.gstRate || 18,
        gstType: product.gstType || 'CGST_SGST',
        hsnCode: product.hsnCode || '',
        gstInclusive: product.gstInclusive || false,
        taxable: product.taxable !== undefined ? product.taxable : true,
      });
    }
  }, [product, type]);

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    // Special handling for GST rate validation
    if (name === 'gstRate') {
      setGstError(''); // Clear previous error

      if (value !== '') {
        const validation = validateGSTRate(value);
        if (!validation.valid) {
          setGstError(validation.error);
          return;
        }
        if (validation.warning) {
          setGstError(`Note: ${validation.warning}`);
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data for API
      const productData = {
        ...formData,
        sku: formData.sku || `SKU-${Date.now()}`, // Generate SKU if not provided
        trackQuantity: true,
        quantity: parseInt(formData.stockQuantity) || 0,
        isActive: formData.inStock,
        isFeatured: formData.featured,
        // GST fields
        gstRate: parseFloat(formData.gstRate) || 18,
        gstType: formData.gstType,
        hsnCode: formData.hsnCode,
        gstInclusive: formData.gstInclusive,
        taxable: formData.taxable,
      };

      if (type === 'create') {
        await adminService.createProduct(productData);
        toast.success('Product created successfully');
      } else if (type === 'edit') {
        await adminService.updateProduct(product._id, productData);
        toast.success('Product updated successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${type === 'create' ? 'create' : 'update'} product`);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = type === 'view';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'create' && 'Add New Product'}
            {type === 'edit' && 'Edit Product'}
            {type === 'view' && 'Product Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label htmlFor="admin-product-name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                id="admin-product-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter product name"
                aria-describedby="admin-product-name-help"
              />
              <p id="admin-product-name-help" className="text-xs text-gray-500 mt-1">
                Enter a descriptive name for your product
              </p>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                disabled={isReadOnly}
                placeholder="Auto-generated if empty"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Compare Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price
              </label>
              <input
                type="number"
                name="comparePrice"
                value={formData.comparePrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                min="0"
                required
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Status Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">In Stock</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">Featured Product</label>
              </div>
            </div>
          </div>

          {/* GST Information Section */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">GST & Tax Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GST Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="gstRate"
                    value={formData.gstRate}
                    onChange={handleInputChange}
                    min="0"
                    max="28"
                    step="0.01"
                    disabled={isReadOnly}
                    placeholder="Enter GST rate"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {commonGSTRates.map((gstOption) => (
                    <button
                      key={gstOption.rate}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gstRate: gstOption.rate }))}
                      disabled={isReadOnly}
                      title={gstOption.description}
                      className={`px-2 py-1 text-xs rounded hover:opacity-80 disabled:opacity-50 ${
                        gstOption.rate === 18
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {gstOption.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter custom GST rate or use quick buttons for common rates
                </p>

                {/* GST Error Message */}
                {gstError && (
                  <p className={`text-xs mt-1 ${gstError.includes('Note:') ? 'text-amber-600' : 'text-red-600'}`}>
                    {gstError}
                  </p>
                )}

                {/* GST Suggestion based on category */}
                {formData.category && (() => {
                  const selectedCategory = categories.find(cat => cat._id === formData.category);
                  const suggestion = selectedCategory ? getGSTSuggestion(selectedCategory.name) : null;
                  return suggestion ? (
                    <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                      <p className="text-xs text-green-800">
                        💡 <strong>Suggestion:</strong> {suggestion.note}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gstRate: suggestion.rate }))}
                          disabled={isReadOnly}
                          className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          Use {suggestion.rate}%
                        </button>
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* GST Calculation Preview */}
                {formData.price && formData.gstRate && formData.taxable && (() => {
                  const calculation = calculateGST(formData.price, formData.gstRate, formData.gstInclusive);
                  const formatted = formatGSTCalculation(calculation);

                  return (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-xs font-medium text-blue-800 mb-1">GST Calculation Preview:</p>
                      <div className="text-xs text-blue-700 space-y-0.5">
                        <div>Base Price: {formatted.basePrice}</div>
                        <div>GST Amount ({formatted.gstRate}): {formatted.gstAmount}</div>
                        <div className="font-medium">Total Price: {formatted.totalPrice}</div>
                        <div className="text-blue-600 italic">{formatted.breakdown}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* GST Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Type
                </label>
                <select
                  name="gstType"
                  value={formData.gstType}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                  <option value="IGST">IGST (Inter-state)</option>
                  <option value="EXEMPT">Exempt</option>
                  <option value="ZERO_RATED">Zero Rated</option>
                </select>
              </div>

              {/* HSN Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  placeholder="e.g., 6203"
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Harmonized System of Nomenclature code for tax classification
                </p>
              </div>

              {/* Tax Options */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="taxable"
                    checked={formData.taxable}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Taxable Product</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="gstInclusive"
                    checked={formData.gstInclusive}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Price includes GST</label>
                </div>
              </div>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              rows={2}
              disabled={isReadOnly}
              placeholder="Brief product description for listings"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
              disabled={isReadOnly}
              placeholder="Detailed product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Product Images */}
          {!isReadOnly && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <ImageUpload
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
                multiple={true}
              />
            </div>
          )}

          {/* View Images (Read-only) */}
          {isReadOnly && formData.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={getMainImageUrl([image])}
                        alt={image.alt || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (type === 'create' ? 'Create Product' : 'Update Product')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;
