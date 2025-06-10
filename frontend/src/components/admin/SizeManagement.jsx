import React, { useState } from 'react';
import { PlusIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';

/**
 * Size Management Component for Admin Product Form
 */
const SizeManagement = ({ sizes, setSizes, sizeChart, setSizeChart, disabled = false }) => {
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Predefined size templates
  const sizeTemplates = {
    clothing: [
      { name: 'XS', label: 'Extra Small', measurements: { chest: '30-32"', waist: '24-26"', length: '26"' } },
      { name: 'S', label: 'Small', measurements: { chest: '34-36"', waist: '28-30"', length: '27"' } },
      { name: 'M', label: 'Medium', measurements: { chest: '38-40"', waist: '32-34"', length: '28"' } },
      { name: 'L', label: 'Large', measurements: { chest: '42-44"', waist: '36-38"', length: '29"' } },
      { name: 'XL', label: 'Extra Large', measurements: { chest: '46-48"', waist: '40-42"', length: '30"' } },
      { name: 'XXL', label: '2X Large', measurements: { chest: '50-52"', waist: '44-46"', length: '31"' } }
    ],
    shoes: [
      { name: '6', label: 'Size 6', measurements: { length: '9.25"', width: '3.5"' } },
      { name: '7', label: 'Size 7', measurements: { length: '9.625"', width: '3.625"' } },
      { name: '8', label: 'Size 8', measurements: { length: '10"', width: '3.75"' } },
      { name: '9', label: 'Size 9', measurements: { length: '10.375"', width: '3.875"' } },
      { name: '10', label: 'Size 10', measurements: { length: '10.75"', width: '4"' } },
      { name: '11', label: 'Size 11', measurements: { length: '11.125"', width: '4.125"' } }
    ]
  };

  const addSize = () => {
    const newSize = {
      name: '',
      label: '',
      measurements: {
        chest: '',
        waist: '',
        length: '',
        sleeve: '',
        shoulder: ''
      },
      stock: 0,
      isAvailable: true,
      sortOrder: sizes.length
    };
    setSizes([...sizes, newSize]);
  };

  const removeSize = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    setSizes(updatedSizes);
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = [...sizes];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedSizes[index][parent][child] = value;
    } else {
      updatedSizes[index][field] = value;
    }
    setSizes(updatedSizes);
  };

  const loadTemplate = (template) => {
    setSizes(sizeTemplates[template].map((size, index) => ({
      ...size,
      stock: 0,
      isAvailable: true,
      sortOrder: index
    })));
  };

  const updateSizeChart = (field, value) => {
    setSizeChart({
      ...sizeChart,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Size Management Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Size Management</h3>
        <div className="flex space-x-2">
          <select
            onChange={(e) => e.target.value && loadTemplate(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
            disabled={disabled}
          >
            <option value="">Load Template</option>
            <option value="clothing">Clothing Sizes</option>
            <option value="shoes">Shoe Sizes</option>
          </select>
          <button
            type="button"
            onClick={addSize}
            disabled={disabled}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Size
          </button>
        </div>
      </div>

      {/* Size List */}
      <div className="space-y-4">
        {sizes.map((size, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Size Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Name *
                </label>
                <input
                  type="text"
                  value={size.name}
                  onChange={(e) => updateSize(index, 'name', e.target.value)}
                  placeholder="e.g., M, L, XL"
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Size Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  value={size.label}
                  onChange={(e) => updateSize(index, 'label', e.target.value)}
                  placeholder="e.g., Medium, Large"
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={size.stock}
                  onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                  min="0"
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={size.isAvailable}
                      onChange={(e) => updateSize(index, 'isAvailable', e.target.checked)}
                      disabled={disabled}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Measurements (Optional)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['chest', 'waist', 'length', 'sleeve', 'shoulder'].map((measurement) => (
                  <div key={measurement}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">
                      {measurement}
                    </label>
                    <input
                      type="text"
                      value={size.measurements[measurement] || ''}
                      onChange={(e) => updateSize(index, `measurements.${measurement}`, e.target.value)}
                      placeholder="e.g., 36-38\""
                      disabled={disabled}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {sizes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No sizes added yet. Click "Add Size" or load a template to get started.</p>
          </div>
        )}
      </div>

      {/* Size Chart Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Size Chart</h3>
          <button
            type="button"
            onClick={() => setShowSizeChart(!showSizeChart)}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
          >
            <ChartBarIcon className="w-4 h-4 mr-1" />
            {showSizeChart ? 'Hide' : 'Show'} Size Chart
          </button>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="enableSizeChart"
            checked={sizeChart.enabled}
            onChange={(e) => updateSizeChart('enabled', e.target.checked)}
            disabled={disabled}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="enableSizeChart" className="ml-2 text-sm text-gray-700">
            Enable size chart for this product
          </label>
        </div>

        {showSizeChart && sizeChart.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size Chart Image URL
              </label>
              <input
                type="url"
                value={sizeChart.image}
                onChange={(e) => updateSizeChart('image', e.target.value)}
                placeholder="https://example.com/size-chart.jpg"
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size Chart Description
              </label>
              <textarea
                value={sizeChart.description}
                onChange={(e) => updateSizeChart('description', e.target.value)}
                placeholder="Instructions on how to measure and use the size chart..."
                rows={3}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SizeManagement;
