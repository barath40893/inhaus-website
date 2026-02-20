import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  CreditCard, 
  Truck, 
  FileText,
  Check,
  Loader2,
  Home,
  ArrowLeft
} from 'lucide-react';

const CustomerCheckoutPage = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading, sessionToken } = useCustomerAuth();
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  
  const [formData, setFormData] = useState({
    shipping_address: '',
    billing_address: '',
    same_as_shipping: true,
    payment_method: 'cod'
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/customer/login?redirect=/customer/checkout');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('customer_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        navigate('/catalog');
      }
      setCart(parsedCart);
    } else {
      navigate('/catalog');
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.18;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/customer/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          shipping_address: formData.shipping_address,
          billing_address: formData.same_as_shipping ? formData.shipping_address : formData.billing_address,
          same_as_shipping: formData.same_as_shipping,
          items: cart,
          payment_method: formData.payment_method
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOrderData(result);
        setOrderSuccess(true);
        localStorage.removeItem('customer_cart');
      } else {
        const error = await response.json();
        alert(`Order failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderData?.order_id) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/customer/orders/${orderData.order_id}/invoice`,
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
        a.download = `invoice_${orderData.order_number}.pdf`;
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

  const handleSendInvoice = async () => {
    if (!orderData?.order_id) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/customer/orders/${orderData.order_id}/send-invoice`,
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

  // Group cart by room for display
  const groupedByRoom = cart.reduce((acc, item) => {
    if (!acc[item.room_name]) {
      acc[item.room_name] = [];
    }
    acc[item.room_name].push(item);
    return acc;
  }, {});

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Order Success Screen
  if (orderSuccess && orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 py-16 mt-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order number is:
            </p>
            
            <div className="bg-orange-50 rounded-xl p-4 mb-8">
              <p className="text-2xl font-bold text-orange-600">{orderData.order_number}</p>
              <p className="text-gray-600 mt-2">
                Total: <span className="font-bold">₹{orderData.total?.toLocaleString()}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDownloadInvoice}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                data-testid="download-invoice-btn"
              >
                <FileText className="mr-2 h-5 w-5" />
                Download Invoice (PDF)
              </Button>
              
              <Button
                onClick={handleSendInvoice}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                data-testid="send-invoice-btn"
              >
                Send Invoice to Email
              </Button>
              
              <Button
                onClick={() => navigate('/customer/orders')}
                variant="outline"
                className="w-full"
              >
                View My Orders
              </Button>
              
              <button
                onClick={() => navigate('/catalog')}
                className="text-orange-600 hover:text-orange-700 font-medium mt-4 block mx-auto"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/customer/cart')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                </div>
                
                <Textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Enter your complete shipping address including:&#10;House/Flat No., Building Name, Street&#10;City, State, PIN Code"
                  className="w-full"
                  data-testid="shipping-address-input"
                />
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
                </div>
                
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="same_as_shipping"
                    checked={formData.same_as_shipping}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    data-testid="same-as-shipping-checkbox"
                  />
                  <span className="text-gray-700">Same as shipping address</span>
                </label>
                
                {!formData.same_as_shipping && (
                  <Textarea
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleChange}
                    required={!formData.same_as_shipping}
                    rows={4}
                    placeholder="Enter your billing address"
                    className="w-full"
                    data-testid="billing-address-input"
                  />
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleChange}
                      className="w-5 h-5 text-orange-500"
                      data-testid="payment-cod"
                    />
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive the order</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={handleChange}
                      className="w-5 h-5 text-orange-500"
                      data-testid="payment-bank"
                    />
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Pay via bank transfer (details in invoice)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-6 text-lg"
                  data-testid="place-order-btn-mobile"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Place Order</>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Items by Room */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {Object.entries(groupedByRoom).map(([roomName, items]) => (
                  <div key={roomName} className="border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-600 mb-2">
                      <Home className="h-4 w-4" />
                      {roomName}
                    </div>
                    {items.map((item) => (
                      <div key={`${item.product_id}-${item.room_name}`} className="flex justify-between text-sm pl-6">
                        <span className="text-gray-600 truncate flex-1">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 ml-2">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">₹{getTax().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-orange-600">
                      ₹{getTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button (Desktop) */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.shipping_address}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-6 text-lg hidden lg:flex"
                data-testid="place-order-btn"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Place Order</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerCheckoutPage;
