import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Home,
  Package,
  Loader2
} from 'lucide-react';

const CustomerCartPage = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  
  const [cart, setCart] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('customer_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('customer_cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const updateQuantity = (productId, roomName, change) => {
    const newCart = cart.map(item => {
      if (item.product_id === productId && item.room_name === roomName) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);
    
    saveCart(newCart);
  };

  const removeItem = (productId, roomName) => {
    const newCart = cart.filter(
      item => !(item.product_id === productId && item.room_name === roomName)
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    localStorage.removeItem('customer_cart');
    setCart([]);
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

  // Group items by room
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-gray-600">{cart.length} item(s) organized by room</p>
            </div>
          </div>
          
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
              data-testid="clear-cart-btn"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse our catalog and add products to your rooms</p>
            <Link to="/catalog">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Browse Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items by Room */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedByRoom).map(([roomName, items]) => (
                <div key={roomName} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Room Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <Home className="h-5 w-5" />
                      <span className="font-semibold text-lg">{roomName}</span>
                      <span className="text-orange-100 text-sm">({items.length} item{items.length > 1 ? 's' : ''})</span>
                    </div>
                  </div>

                  {/* Room Items */}
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div 
                        key={`${item.product_id}-${item.room_name}`} 
                        className="p-4 flex gap-4"
                        data-testid={`cart-item-${item.product_id}`}
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url?.startsWith('http') ? item.image_url : `${backendUrl}${item.image_url}`}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                          <p className="text-sm text-gray-500">Model: {item.model_no}</p>
                          <p className="text-orange-600 font-semibold mt-1">
                            ₹{item.price?.toLocaleString()} × {item.quantity}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.product_id, item.room_name)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            data-testid={`remove-item-${item.product_id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.room_name, -1)}
                              className="p-1 hover:bg-gray-200 rounded"
                              data-testid={`decrease-qty-${item.product_id}`}
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.room_name, 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                              data-testid={`increase-qty-${item.product_id}`}
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                          
                          <p className="font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Room Summary */}
                <div className="space-y-3 mb-6">
                  {Object.entries(groupedByRoom).map(([roomName, items]) => {
                    const roomTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    return (
                      <div key={roomName} className="flex justify-between text-sm">
                        <span className="text-gray-600">{roomName}</span>
                        <span className="font-medium">₹{roomTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

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

                {!isAuthenticated && (
                  <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2" data-testid="cart-login-notice">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      You&apos;ll be asked to sign in or create an account before placing your order.
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/customer/login?redirect=/customer/checkout');
                    } else {
                      navigate('/customer/checkout');
                    }
                  }}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-6 text-lg"
                  data-testid="proceed-checkout-btn"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign In & Checkout'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Link to="/catalog" className="block text-center mt-4 text-orange-600 hover:text-orange-700 font-medium">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CustomerCartPage;
