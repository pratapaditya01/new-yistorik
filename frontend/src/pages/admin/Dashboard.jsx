import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/currency';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: [],
    salesData: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  // Sample data - replace with actual API calls
  const sampleStats = {
    totalRevenue: 3456789.50, // ₹34,56,789.50
    totalOrders: 1234,
    totalProducts: 156,
    totalUsers: 2890,
    recentOrders: [
      {
        id: 'ORD-001',
        customer: 'John Doe',
        email: 'john@example.com',
        total: 3899.75, // ₹3,899.75
        status: 'completed',
        date: '2024-01-15',
        items: 3,
      },
      {
        id: 'ORD-002',
        customer: 'Jane Smith',
        email: 'jane@example.com',
        total: 2675.50, // ₹2,675.50
        status: 'processing',
        date: '2024-01-15',
        items: 2,
      },
      {
        id: 'ORD-003',
        customer: 'Mike Johnson',
        email: 'mike@example.com',
        total: 5999.00, // ₹5,999.00
        status: 'shipped',
        date: '2024-01-14',
        items: 1,
      },
      {
        id: 'ORD-004',
        customer: 'Sarah Wilson',
        email: 'sarah@example.com',
        total: 2250.25, // ₹2,250.25
        status: 'pending',
        date: '2024-01-14',
        items: 4,
      },
    ],
    topProducts: [
      {
        id: '1',
        name: 'Classic White T-Shirt',
        sales: 145,
        revenue: 130500.00, // ₹1,30,500.00
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      },
      {
        id: '2',
        name: 'Denim Jacket',
        sales: 89,
        revenue: 240300.00, // ₹2,40,300.00
        image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      },
      {
        id: '3',
        name: 'Summer Dress',
        sales: 67,
        revenue: 160779.75, // ₹1,60,779.75
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      },
    ],
    salesData: [
      { date: '2024-01-08', sales: 1200 },
      { date: '2024-01-09', sales: 1800 },
      { date: '2024-01-10', sales: 1500 },
      { date: '2024-01-11', sales: 2200 },
      { date: '2024-01-12', sales: 1900 },
      { date: '2024-01-13', sales: 2500 },
      { date: '2024-01-14', sales: 2100 },
    ],
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setStats(sampleStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.name || 'Admin'}! Here's what's happening with your store.
            </p>
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-500">
              Logged in as: {user?.email} ({user?.role})
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <Link
              to="/admin/products"
              className="btn-primary btn-md flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Manage Products
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={CurrencyDollarIcon}
            change={12.5}
            changeType="increase"
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={ShoppingBagIcon}
            change={8.2}
            changeType="increase"
            color="blue"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts.toLocaleString()}
            icon={ChartBarIcon}
            change={3.1}
            changeType="increase"
            color="purple"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={UsersIcon}
            change={15.3}
            changeType="increase"
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{order.items} items</span>
                    <span>{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg shadow-md"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <Link
                to="/admin/products"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(product.revenue)}</p>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">#{index + 1}</span>
                        <ArrowUpIcon className="h-4 w-4 text-green-500 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">Add, edit, delete products</p>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingBagIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-600">View and process orders</p>
              </div>
            </Link>

            <Link
              to="/admin/deliveries"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TruckIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Delivery Management</p>
                <p className="text-sm text-gray-600">Track deliveries & addresses</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View customer accounts</p>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View detailed reports</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
