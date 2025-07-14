import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon, WalletIcon } from '@heroicons/react/24/outline';
import razorpayService from '../../services/razorpayService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Razorpay Payment Component
 */
const RazorpayPayment = ({ 
  orderData, 
  onSuccess, 
  onError, 
  disabled = false,
  className = '' 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!orderData || !orderData.amount) {
      toast.error('Invalid order data');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare user information
      const userInfo = {
        name: user?.name || orderData.shippingAddress?.firstName + ' ' + orderData.shippingAddress?.lastName || '',
        email: user?.email || orderData.shippingAddress?.email || '',
        contact: user?.phone || orderData.shippingAddress?.phone || ''
      };

      // Process payment
      const result = await razorpayService.processPayment(orderData, userInfo);

      if (result.success) {
        toast.success('Payment completed successfully!');
        
        // Clear cart on successful payment
        clearCart();
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        } else {
          // Default navigation to order success page
          navigate(`/order-success/${result.order.id}`);
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.message === 'Payment cancelled by user') {
        errorMessage = 'Payment was cancelled';
        toast.error(errorMessage);
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // Call error callback
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    return razorpayService.formatAmount(amount);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>


      

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatAmount(orderData.itemsPrice || orderData.amount)}</span>
          </div>
          {orderData.shippingPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{formatAmount(orderData.shippingPrice)}</span>
            </div>
          )}
          {orderData.taxPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">GST</span>
              <span className="text-gray-900">{formatAmount(orderData.taxPrice)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatAmount(orderData.amount)}</span>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Secure Payment</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your payment information is encrypted and secure. Powered by Razorpay.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing || !orderData}
        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors ${
          disabled || isProcessing || !orderData
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
        }`}
      >
        {isProcessing ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            Pay {orderData ? formatAmount(orderData.amount) : ''}
          </>
        )}
      </button>

      {/* Payment Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By proceeding, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

/**
 * Simple Razorpay Button Component
 */
export const RazorpayButton = ({ 
  amount, 
  onSuccess, 
  onError, 
  children,
  className = '',
  ...props 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    setIsProcessing(true);
    
    try {
      const orderData = { amount };
      const result = await razorpayService.processPayment(orderData);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isProcessing ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : (
        children || `Pay ${razorpayService.formatAmount(amount)}`
      )}
    </button>
  );
};

export default RazorpayPayment;
