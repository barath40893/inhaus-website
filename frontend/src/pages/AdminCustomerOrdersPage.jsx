import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { 
  ShoppingBag, 
  Search, 
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  IndianRupee
} from 'lucide-react';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['pending', 'paid', 'failed'];

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  processing: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
  shipped: { icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' }
};

const AdminCustomerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    pendingOrders: 0
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/admin/customer-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderData) => {
    const totalOrders = orderData.length;
    const totalRevenue = orderData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalProfit = orderData.reduce((sum, order) => sum + (order.profit_margin || 0), 0);
    const pendingOrders = orderData.filter(order => order.order_status === 'pending').length;
    
    setStats({ totalOrders, totalRevenue, totalProfit, pendingOrders });
  };

  const updateOrderStatus = async (orderId, field, value) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/admin/customer-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
            <p className="text-gray-600">Manage and track customer orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-orange-600">₹{stats.totalProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by order number, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  {/* Order Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${status.bg}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.customer_name} • {order.customer_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{order.total?.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Profit: ₹{order.profit_margin?.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={order.order_status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'order_status', e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          
                          <select
                            value={order.payment_status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'payment_status', e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            {paymentStatusOptions.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                        
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {/* Items */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                {item.image_url && (
                                  <img src={`${backendUrl}${item.image_url}`} alt={item.product_name} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.room_name} • {item.model_no} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{item.total_price?.toLocaleString()}</p>
                                <p className="text-xs text-green-600">Cost: ₹{item.total_cost?.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-medium text-gray-900 mb-1">Shipping Address</p>
                          <p className="text-sm text-gray-600">{order.shipping_address}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="font-medium text-gray-900 mb-1">Billing Address</p>
                          <p className="text-sm text-gray-600">{order.billing_address}</p>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="bg-white rounded-lg p-3">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-500">Subtotal</p>
                            <p className="font-medium">₹{order.subtotal?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tax ({order.tax_percentage}%)</p>
                            <p className="font-medium">₹{order.tax_amount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-bold text-orange-600">₹{order.total?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cost</p>
                            <p className="font-medium text-red-600">₹{order.total_cost?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Profit</p>
                            <p className="font-bold text-green-600">₹{order.profit_margin?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomerOrdersPage;
