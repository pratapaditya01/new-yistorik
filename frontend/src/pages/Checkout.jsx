import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/currency';
import RazorpayPayment from '../components/payment/RazorpayPayment';
import { analytics } from '../utils/analytics';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [loading, setLoading] = useState(false);

  const [guestInfo, setGuestInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Track checkout start when component mounts
  useEffect(() => {
    if (cartItems.length > 0) {
      analytics.trackCheckoutStart(cartItems, getTotalPrice());
    }
  }, [cartItems, getTotalPrice]);

  const handleGuestInfoChange = (e) => {
    setGuestInfo({
      ...guestInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate required fields
    if (!isAuthenticated) {
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        toast.error('Please fill in all customer information fields');
        return;
      }
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    setLoading(true);

    try {
      // Calculate prices with proper per-product GST
      const itemsPrice = getTotalPrice();
      const shippingPrice = itemsPrice > 499 ? 0 : 99; // Free shipping over ₹499, otherwise ₹99

      // Calculate GST based on individual product rates (CRITICAL FIX)
      const taxPrice = cartItems.reduce((total, item) => {
        const gstRate = item.product.gstRate || 0;
        const itemTotal = item.price * item.quantity;
        const gstAmount = item.product.gstInclusive
          ? itemTotal - (itemTotal / (1 + gstRate / 100))
          : itemTotal * (gstRate / 100);
        return total + gstAmount;
      }, 0);

      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      console.log('💰 CHECKOUT - GST Calculation Debug:');
      console.log('Items price:', itemsPrice);
      console.log('Shipping price:', shippingPrice);
      console.log('Tax price (calculated from products):', taxPrice);
      console.log('Total price:', totalPrice);

      console.log('Cart items before processing:', cartItems);
      console.log('Cart items structure check:', cartItems.map(item => ({
        id: item.id,
        productId: item.product?._id,
        productName: item.product?.name,
        hasProduct: !!item.product
      })));

      // Prepare order items for backend
      const orderItems = cartItems.map(item => ({
        productId: item.product._id,  // Use productId to match backend expectation
        product: item.product._id,    // Keep product for backward compatibility
        name: item.product.name,
        image: item.product.images?.[0]?.url || '/placeholder.jpg',
        price: item.price,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || []
      }));

      console.log('Order items after mapping:', orderItems);
      console.log('Order items productId check:', orderItems.map(item => ({
        name: item.name,
        productId: item.productId,
        product: item.product,
        hasProductId: !!item.productId
      })));

      // Debug size information in order items
      console.log('📏 CHECKOUT - Size information in order items:');
      console.log('Cart items with sizes:', cartItems.map(item => ({
        name: item.product.name,
        selectedVariants: item.selectedVariants
      })));

      // Prepare shipping address
      const fullShippingAddress = {
        fullName: isAuthenticated ? user.name : `${guestInfo.firstName} ${guestInfo.lastName}`,
        address: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: isAuthenticated ? user.phone || guestInfo.phone : guestInfo.phone
      };

      // Prepare order data
      const orderData = {
        orderItems,
        shippingAddress: fullShippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isGuestOrder: !isAuthenticated
      };

      // Add guest info if not authenticated
      if (!isAuthenticated) {
        orderData.guestInfo = {
          email: guestInfo.email,
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone
        };
      }

      console.log('Submitting order:', orderData);

      // Debug final order data with sizes
      console.log('💳 CHECKOUT - Final order data with sizes:');
      console.log('Order data:', JSON.stringify(orderData, null, 2));

      // Create order in database
      const response = await orderService.createOrder(orderData);

      console.log('Order created:', response);

      // Track purchase completion
      analytics.trackPurchase({
        ...response,
        paymentMethod: 'cod'
      });

      // Clear cart and show success
      clearCart();
      toast.success('Order placed successfully! Order number: ' + response.orderNumber);

      // Redirect to success page or home
      navigate('/', {
        state: {
          message: `Thank you for your order! Order number: ${response.orderNumber}. You will receive a confirmation email shortly.`
        }
      });

    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>

              {!isAuthenticated && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Already have an account?
                    <Link to="/login" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}

              {isAuthenticated ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={guestInfo.firstName}
                      onChange={handleGuestInfoChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={guestInfo.lastName}
                      onChange={handleGuestInfoChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={guestInfo.email}
                      onChange={handleGuestInfoChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={guestInfo.phone}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>



              <div className="space-y-4">
             
                {/* Cash on Delivery */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">
                        💵 Cash on Delivery
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Pay when your order is delivered to your doorstep
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Razorpay Payment Component */}
              {paymentMethod === 'razorpay' && (
                <div className="mt-6">
                  <RazorpayPayment
                    orderData={(() => {
                      // Calculate proper GST based on individual products
                      const subtotal = getTotalPrice();
                      const shipping = subtotal > 499 ? 0 : 99;
                      const totalGST = cartItems.reduce((total, item) => {
                        const gstRate = item.product.gstRate || 0;
                        const itemTotal = item.price * item.quantity;
                        const gstAmount = item.product.gstInclusive
                          ? itemTotal - (itemTotal / (1 + gstRate / 100))
                          : itemTotal * (gstRate / 100);
                        return total + gstAmount;
                      }, 0);

                      const orderData = {
                        amount: subtotal + shipping + totalGST,
                        itemsPrice: subtotal,
                        shippingPrice: shipping,
                        taxPrice: totalGST,
                        items: cartItems.map(item => ({
                          productId: item.product._id,
                          name: item.product.name,
                          image: item.product.images?.[0]?.url || '/placeholder.jpg',
                          price: item.price,
                          quantity: item.quantity,
                          selectedVariants: item.selectedVariants || []
                        })),
                        shippingAddress: shippingAddress
                      };

                      // Debug the order data
                      console.log('💳 CHECKOUT - Razorpay order data:');
                      console.log('Razorpay order data:', orderData);

                      return orderData;
                    })()}
                    onSuccess={() => {
                      toast.success('Payment successful!');
                      // Clear cart and navigate will be handled by the component
                    }}
                    onError={(error) => {
                      toast.error(error.message || 'Payment failed');
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder-image.jpg'}
                    alt={item.product?.name || 'Product'}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.selectedVariants && item.selectedVariants.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {item.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{getTotalPrice() > 499 ? 'Free' : formatPrice(99)}</span>
              </div>
              {/* Calculate GST based on individual product rates */}
              {(() => {
                const totalGST = cartItems.reduce((total, item) => {
                  const gstRate = item.product.gstRate || 0;
                  const itemTotal = item.price * item.quantity;
                  const gstAmount = item.product.gstInclusive
                    ? itemTotal - (itemTotal / (1 + gstRate / 100))
                    : itemTotal * (gstRate / 100);
                  return total + gstAmount;
                }, 0);

                // Only show GST line if there's GST to be charged
                if (totalGST > 0) {
                  return (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST</span>
                      <span className="text-gray-900">{formatPrice(totalGST)}</span>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {(() => {
                    const subtotal = getTotalPrice();
                    const shipping = subtotal > 499 ? 0 : 99;
                    const totalGST = cartItems.reduce((total, item) => {
                      const gstRate = item.product.gstRate || 0;
                      const itemTotal = item.price * item.quantity;
                      const gstAmount = item.product.gstInclusive
                        ? itemTotal - (itemTotal / (1 + gstRate / 100))
                        : itemTotal * (gstRate / 100);
                      return total + gstAmount;
                    }, 0);
                    return formatPrice(subtotal + shipping + totalGST);
                  })()}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <form onSubmit={handleSubmitOrder} className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
