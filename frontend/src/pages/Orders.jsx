import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/currency';
import { getMainImageUrl } from '../utils/imageUtils';
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ShoppingBagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: ClockIcon,
      label: 'Pending'
    },
    processing: {
      color: 'bg-blue-100 text-blue-800',
      icon: CurrencyDollarIcon,
      label: 'Processing'
    },
    shipped: {
      color: 'bg-purple-100 text-purple-800',
      icon: TruckIcon,
      label: 'Shipped'
    },
    delivered: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircleIcon,
      label: 'Delivered'
    },
    cancelled: {
      color: 'bg-red-100 text-red-800',
      icon: XCircleIcon,
      label: 'Cancelled'
    },
    refunded: {
      color: 'bg-gray-100 text-gray-800',
      icon: DocumentTextIcon,
      label: 'Refunded'
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your order history
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.key !== 'all' && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {orders.filter(o => o.status === tab.key).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${filter} orders.`
              }
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <ShoppingBagIcon className="h-4 w-4 mr-1" />
                              {order.orderItems?.length || 0} items
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.label}
                        </span>
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {order.orderItems?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <img
                              src={getMainImageUrl(item.product?.images)}
                              alt={item.name}
                              className="h-12 w-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/48x48/f3f4f6/9ca3af?text=No+Image';
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.orderItems?.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{order.orderItems.length - 3} more items
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.paymentMethod === 'razorpay' ? 'Paid Online' : 'Cash on Delivery'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderModal(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  const status = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    processing: { color: 'bg-blue-100 text-blue-800', icon: CurrencyDollarIcon },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
    refunded: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon }
  }[order.status];

  const StatusIcon = status.icon;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={getMainImageUrl(item.product?.images)}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/64x64/f3f4f6/9ca3af?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    {item.selectedSize && (
                      <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.itemsPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.taxPrice || 0)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Shipping Address
              </h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && (
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Payment Information
              </h4>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Method:</span>{' '}
                  {order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={order.isPaid ? 'text-green-600' : 'text-yellow-600'}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </p>
                {order.paidAt && (
                  <p>
                    <span className="font-medium">Paid on:</span>{' '}
                    {formatDate(order.paidAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Tracking Information
                </h4>
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Tracking Number:</span>{' '}
                    {order.trackingNumber}
                  </p>
                  {order.deliveredAt && (
                    <p>
                      <span className="font-medium">Delivered on:</span>{' '}
                      {formatDate(order.deliveredAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
          {order.status === 'delivered' && (
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Leave Review
            </button>
          )}
          {order.status === 'pending' && (
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Cancel Order
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
