import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  Package, 
  FileText, 
  Download, 
  Mail,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Cancelled' }
};

const paymentStatusConfig = {
  pending: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Payment Pending' },
  paid: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Paid' },
  failed: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' }
};

const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, sessionToken } = useCustomerAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/customer/login?redirect=/customer/orders');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/customer/orders`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/customer/orders/${orderId}/invoice`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download invoice');
    }
  };

  const handleSendInvoice = async (orderId) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/customer/orders/${orderId}/send-invoice`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      }
    } catch (error) {
      console.error('Send invoice error:', error);
      alert('Failed to send invoice');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Group items by room for display
  const groupItemsByRoom = (items) => {
    return items.reduce((acc, item) => {
      const room = item.room_name || 'General';
      if (!acc[room]) {
        acc[room] = [];
      }
      acc[room].push(item);
      return acc;
    }, {});
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Package className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <p className="text-neutral-400">View and manage your orders</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-neutral-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-12 text-center">
            <Package className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-neutral-500 mb-6">Start shopping to see your orders here</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.pending;
              const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;
              const groupedItems = groupItemsByRoom(order.items || []);

              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  data-testid={`order-${order.id}`}
                >
                  {/* Order Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${status.bg}`}>
                          <StatusIcon className={`h-6 w-6 ${status.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{order.order_number}</h3>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-orange-600 text-lg">
                            ₹{order.total?.toLocaleString()}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${paymentStatus.bg} ${paymentStatus.color}`}>
                              {paymentStatus.label}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Items by Room */}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                        
                        {Object.entries(groupedItems).map(([roomName, items]) => (
                          <div key={roomName} className="mb-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 mb-2">
                              <Package className="h-4 w-4" />
                              {roomName}
                            </div>
                            
                            <div className="space-y-2 pl-6">
                              {items.map((item, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {item.image_url && (
                                      <img
                                        src={`${backendUrl}${item.image_url}`}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    <p className="text-sm text-gray-500">
                                      Model: {item.model_no} × {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-gray-900">
                                    ₹{item.total_price?.toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Addresses */}
                      <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">Shipping Address</h5>
                          <p className="text-sm text-gray-600">{order.shipping_address}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">Billing Address</h5>
                          <p className="text-sm text-gray-600">{order.billing_address}</p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="px-6 pb-4">
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>GST ({order.tax_percentage}%)</span>
                            <span>₹{order.tax_amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-orange-200 pt-2 mt-2">
                            <span>Total</span>
                            <span className="text-orange-600">₹{order.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-6 pb-6 flex gap-3">
                        <Button
                          onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          data-testid={`download-invoice-${order.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                        <Button
                          onClick={() => handleSendInvoice(order.id)}
                          variant="outline"
                          className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
                          data-testid={`send-invoice-${order.id}`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Invoice
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CustomerOrdersPage;
