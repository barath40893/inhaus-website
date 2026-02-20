import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId, orderNumber) => {
    try {
      const token = localStorage.getItem('adminToken');
      const timestamp = new Date().getTime();
      const response = await fetch(`${backendUrl}/api/admin/orders/${orderId}/download-invoice?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${orderNumber.replace('/', '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_status: orderStatus, payment_status: paymentStatus })
      });
      
      if (response.ok) {
        alert('Order status updated successfully!');
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shop Orders</h1>
            <p className="text-gray-600 mt-2">Manage orders with profit tracking</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex gap-4">
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div></div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center"><p className="text-gray-500 text-lg">No orders found</p></div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.order_number}</td>
                      <td className="px-6 py-4"><div className="text-sm font-medium">{order.customer.name}</div><div className="text-xs text-gray-500">{order.customer.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">₹{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">₹{order.profit_margin.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${getPaymentBadge(order.payment_status)}`}>{order.payment_status}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><select value={order.order_status} onChange={(e) => updateOrderStatus(order.id, e.target.value, order.payment_status)} className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.order_status)}`}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="delivered">Delivered</option></select></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={() => downloadInvoice(order.id, order.order_number)} className="text-green-600 hover:text-green-900">Invoice</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
  );
};

export default AdminOrdersPage;
