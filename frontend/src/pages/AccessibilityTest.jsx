import React, { useState } from 'react';
import FormField, { SelectField, TextareaField, CheckboxField } from '../components/ui/FormField';
import CORSImage, { CORSProductImage } from '../components/ui/CORSImage';

/**
 * Test page for accessibility features and CORS image handling
 */
const AccessibilityTest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
    newsletter: false,
    terms: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully! Check console for data.');
      console.log('Form data:', formData);
    }
  };

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const testImages = [
    'https://new-yistorik.onrender.com/uploads/sample1.jpg',
    'https://new-yistorik.onrender.com/uploads/sample2.jpg',
    'https://placehold.co/300x300/f3f4f6/9ca3af?text=External+Image',
    'https://broken-url.com/image.jpg',
    ''
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Accessibility & CORS Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Testing form accessibility and image CORS handling
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Accessibility Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Accessibility Test</h2>
            
            <form onSubmit={handleSubmit} noValidate>
              <FormField
                id="test-name"
                name="name"
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                error={errors.name}
                helpText="This field is required and must contain your full name"
              />

              <FormField
                id="test-email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                error={errors.email}
                helpText="We'll use this to contact you about your inquiry"
              />

              <SelectField
                id="test-category"
                name="category"
                label="Inquiry Category"
                value={formData.category}
                onChange={handleInputChange}
                options={categoryOptions}
                required
                error={errors.category}
                helpText="Select the category that best describes your inquiry"
                placeholder="Choose a category"
              />

              <TextareaField
                id="test-message"
                name="message"
                label="Message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your message here..."
                rows={4}
                helpText="Provide details about your inquiry (optional)"
              />

              <CheckboxField
                id="test-newsletter"
                name="newsletter"
                label="Subscribe to newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
                helpText="Receive updates about new products and features"
              />

              <CheckboxField
                id="test-terms"
                name="terms"
                label="I accept the terms and conditions"
                checked={formData.terms}
                onChange={handleInputChange}
                required
                error={errors.terms}
                helpText="You must accept our terms to continue"
              />

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Submit Form
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      category: '',
                      message: '',
                      newsletter: false,
                      terms: false
                    });
                    setErrors({});
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          {/* CORS Image Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">CORS Image Test</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Backend Images (CORS Test)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {testImages.slice(0, 2).map((src, index) => (
                    <div key={index} className="text-center">
                      <CORSImage
                        src={src}
                        alt={`Backend test image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        fallbackType="product"
                      />
                      <p className="text-xs text-gray-500 mt-2">Backend Image {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">External & Error Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {testImages.slice(2).map((src, index) => (
                    <div key={index + 2} className="text-center">
                      <CORSImage
                        src={src}
                        alt={`Test image ${index + 3}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        fallbackType="product"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {index === 0 ? 'External Image' : 
                         index === 1 ? 'Broken URL' : 'Empty Source'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Image Component</h3>
                <div className="flex justify-center space-x-4">
                  <CORSProductImage
                    src="https://new-yistorik.onrender.com/uploads/sample1.jpg"
                    alt="Product test"
                    size="lg"
                  />
                  <CORSProductImage
                    src="https://broken-url.com/product.jpg"
                    alt="Broken product"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features Tested</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Form Accessibility</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Proper label associations (htmlFor/id)</li>
                <li>✅ Required field indicators</li>
                <li>✅ ARIA attributes (aria-describedby, aria-invalid)</li>
                <li>✅ Error messages with role="alert"</li>
                <li>✅ Help text associations</li>
                <li>✅ Keyboard navigation support</li>
                <li>✅ Focus management</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Image CORS Handling</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ CORS header handling for backend images</li>
                <li>✅ Fallback for CORB blocked images</li>
                <li>✅ Graceful error handling</li>
                <li>✅ Loading states</li>
                <li>✅ Placeholder fallbacks</li>
                <li>✅ Cross-origin resource policy</li>
                <li>✅ Image preloading support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityTest;
