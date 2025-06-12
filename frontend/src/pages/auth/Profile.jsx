import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  CalendarIcon,
  HeartIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState({
    personal: false,
    address: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'India',
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [ordersResponse, wishlistResponse] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/users/wishlist'),
      ]);

      const orders = ordersResponse.orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      setStats({
        totalOrders: orders.length,
        wishlistItems: wishlistResponse.length || 0,
        totalSpent,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePersonalInfoUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      const response = await api.put('/auth/profile', updateData);
      updateUser(response);
      setEditMode(prev => ({ ...prev, personal: false }));
      toast.success('Personal information updated successfully');
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error(error.response?.data?.message || 'Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        address: formData.address,
      };

      const response = await api.put('/auth/profile', updateData);
      updateUser(response);
      setEditMode(prev => ({ ...prev, address: false }));
      toast.success('Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.response?.data?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await api.put('/auth/profile', {
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
      });

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setEditMode(prev => ({ ...prev, password: false }));
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = (section) => {
    setEditMode(prev => ({ ...prev, [section]: false }));
    // Reset form data to original values
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'India',
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center justify-center mt-2">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 capitalize">{user.role}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <ShoppingBagIcon className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <HeartIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                  <p className="text-sm text-gray-500">Wishlist Items</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(stats.totalSpent)}</p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                {!editMode.personal ? (
                  <button
                    onClick={() => setEditMode(prev => ({ ...prev, personal: true }))}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePersonalInfoUpdate}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit('personal')}
                      className="text-gray-600 hover:text-gray-700 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {editMode.personal ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {editMode.personal ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {user.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Address Information
                </h3>
                {!editMode.address ? (
                  <button
                    onClick={() => setEditMode(prev => ({ ...prev, address: true }))}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddressUpdate}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit('address')}
                      className="text-gray-600 hover:text-gray-700 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    {editMode.address ? (
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.street || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {editMode.address ? (
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.city || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    {editMode.address ? (
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter state"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.state || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    {editMode.address ? (
                      <input
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter postal code"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.postalCode || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    {editMode.address ? (
                      <select
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.address?.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Password Change */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  Password & Security
                </h3>
                {!editMode.password ? (
                  <button
                    onClick={() => setEditMode(prev => ({ ...prev, password: true }))}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Change Password
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Update
                    </button>
                    <button
                      onClick={() => cancelEdit('password')}
                      className="text-gray-600 hover:text-gray-700 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="px-6 py-4">
                {editMode.password ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Password Requirements:</strong>
                        <br />
                        • At least 6 characters long
                        <br />
                        • Use a combination of letters, numbers, and symbols for better security
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <p>••••••••••••</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: Never
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
