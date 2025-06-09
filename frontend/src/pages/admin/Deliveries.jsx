import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: ClockIcon,
    processing: CubeIcon,
    shipped: TruckIcon,
    delivered: CheckCircleIcon,
    cancelled: XCircleIcon
  };

  useEffect(() => {
    fetchDeliveries();
  }, [pagination.page, statusFilter, searchTerm]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await api.get('/admin/orders', { params });
      
      // Filter orders that need delivery tracking (shipped or delivered)
      const deliveryOrders = response.orders.filter(order => 
        ['processing', 'shipped', 'delivered'].includes(order.status)
      );
      
      setDeliveries(deliveryOrders);
      setPagination(prev => ({
        ...prev,
        total: deliveryOrders.length,
        pages: Math.ceil(deliveryOrders.length / prev.limit)
      }));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to fetch delivery information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    try {
      await api.put(`/admin/orders/${selectedDelivery._id}/tracking`, {
        trackingNumber,
        notes: deliveryNotes
      });

      toast.success('Tracking information updated successfully');
      setShowTrackingModal(false);
      setTrackingNumber('');
      setDeliveryNotes('');
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking information');
    }
  };

  const markAsDelivered = async (orderId) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: 'delivered',
        note: 'Package delivered successfully'
      });

      toast.success('Order marked as delivered');
      fetchDeliveries();
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to mark as delivered');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const openDeliveryDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryModal(true);
  };

  const openTrackingModal = (delivery) => {
    setSelectedDelivery(delivery);
    setTrackingNumber(delivery.trackingNumber || '');
    setShowTrackingModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
          <p className="mt-2 text-gray-600">
            Track and manage product deliveries and shipping addresses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => d.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => d.status === 'shipped').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPinIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Delivery Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {deliveries.length} delivery orders
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => {
                  const StatusIcon = statusIcons[delivery.status];
                  return (
                    <tr key={delivery._id} className="hover:bg-gray-50">
                      {/* Order Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(delivery.createdAt)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.user?.name || 'Guest User'}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(delivery.totalPrice)}
                          </div>
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center mb-1">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="font-medium text-gray-900">
                              {delivery.shippingAddress?.fullName}
                            </span>
                          </div>
                          <div className="text-gray-600 ml-5">
                            <div>{delivery.shippingAddress?.address}</div>
                            <div>
                              {delivery.shippingAddress?.city}, {delivery.shippingAddress?.state} {delivery.shippingAddress?.zipCode}
                            </div>
                            <div>{delivery.shippingAddress?.country}</div>
                          </div>
                          {delivery.shippingAddress?.phone && (
                            <div className="flex items-center mt-1 ml-5">
                              <PhoneIcon className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {delivery.shippingAddress.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Products */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 mb-1">
                            {delivery.orderItems?.length || 0} items
                          </div>
                          <div className="space-y-1">
                            {delivery.orderItems?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex items-center">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-8 w-8 rounded object-cover mr-2"
                                />
                                <div>
                                  <div className="text-xs text-gray-900 truncate max-w-32">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {delivery.orderItems?.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{delivery.orderItems.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Tracking */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[delivery.status]}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                          </span>
                          {delivery.trackingNumber && (
                            <div className="mt-1">
                              <div className="text-xs text-gray-500">Tracking:</div>
                              <div className="text-xs font-mono text-gray-900">
                                {delivery.trackingNumber}
                              </div>
                            </div>
                          )}
                          {delivery.deliveredAt && (
                            <div className="mt-1">
                              <div className="text-xs text-gray-500">Delivered:</div>
                              <div className="text-xs text-gray-900">
                                {formatDate(delivery.deliveredAt)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDeliveryDetails(delivery)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Delivery Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openTrackingModal(delivery)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Update Tracking"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {delivery.status === 'shipped' && (
                            <button
                              onClick={() => markAsDelivered(delivery._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Delivered"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {deliveries.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No orders are currently in delivery status.
              </p>
            </div>
          )}
        </div>

        {/* Delivery Details Modal */}
        {showDeliveryModal && selectedDelivery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delivery Details - {selectedDelivery.orderNumber}
                  </h3>
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Delivery Information */}
                  <div className="space-y-6">
                    {/* Delivery Address */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                        Delivery Address
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{selectedDelivery.shippingAddress?.fullName}</p>
                        <p>{selectedDelivery.shippingAddress?.address}</p>
                        <p>
                          {selectedDelivery.shippingAddress?.city}, {selectedDelivery.shippingAddress?.state} {selectedDelivery.shippingAddress?.zipCode}
                        </p>
                        <p>{selectedDelivery.shippingAddress?.country}</p>
                        {selectedDelivery.shippingAddress?.phone && (
                          <p className="flex items-center mt-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {selectedDelivery.shippingAddress.phone}
                          </p>
                        )}
                        {selectedDelivery.user?.email && (
                          <p className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {selectedDelivery.user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <TruckIcon className="h-5 w-5 text-gray-600 mr-2" />
                        Delivery Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Current Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedDelivery.status]}`}>
                            {selectedDelivery.status.charAt(0).toUpperCase() + selectedDelivery.status.slice(1)}
                          </span>
                        </div>
                        {selectedDelivery.trackingNumber && (
                          <div className="flex items-center justify-between">
                            <span>Tracking Number:</span>
                            <span className="font-mono text-sm">{selectedDelivery.trackingNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Order Date:</span>
                          <span>{formatDate(selectedDelivery.createdAt)}</span>
                        </div>
                        {selectedDelivery.deliveredAt && (
                          <div className="flex items-center justify-between">
                            <span>Delivered Date:</span>
                            <span>{formatDate(selectedDelivery.deliveredAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products to Deliver */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CubeIcon className="h-5 w-5 text-gray-600 mr-2" />
                      Products to Deliver
                    </h4>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        {selectedDelivery.orderItems?.map((item, index) => (
                          <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 rounded object-cover"
                              />
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                                {item.selectedVariants?.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {item.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')}
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Delivery Summary</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Items:</span>
                          <span>{selectedDelivery.orderItems?.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span>~{(selectedDelivery.orderItems?.length * 0.5).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total Value:</span>
                          <span>{formatCurrency(selectedDelivery.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDeliveryModal(false);
                      openTrackingModal(selectedDelivery);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Update Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Update Modal */}
        {showTrackingModal && selectedDelivery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Update Tracking Information
                  </h3>
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number
                    </label>
                    <p className="text-sm text-gray-900">{selectedDelivery.orderNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedDelivery.status]}`}>
                      {selectedDelivery.status.charAt(0).toUpperCase() + selectedDelivery.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Notes
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={3}
                      placeholder="Add delivery notes or instructions..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Delivery Address:</h4>
                    <div className="text-sm text-blue-800">
                      <p>{selectedDelivery.shippingAddress?.fullName}</p>
                      <p>{selectedDelivery.shippingAddress?.address}</p>
                      <p>
                        {selectedDelivery.shippingAddress?.city}, {selectedDelivery.shippingAddress?.state} {selectedDelivery.shippingAddress?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTracking}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Update Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deliveries;
