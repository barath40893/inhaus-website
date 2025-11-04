import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // Validate cart
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add items to cart before placing order.',
        variant: 'destructive',
      });
      return;
    }

    // Here you would typically send order to backend
    toast({
      title: 'Order Placed Successfully! 🎉',
      description: `Your order of ₹${getCartTotal()} has been confirmed. We'll send you updates via email.`,
    });

    // Clear cart and redirect
    clearCart();
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <ShoppingBag size={80} className="text-gray-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-xl text-gray-600 mb-8">Add some products to get started!</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg rounded-2xl"
            >
              Browse Products
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 text-center">
            Checkout
          </h1>
          <p className="text-xl text-gray-600 text-center">Complete your purchase</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="premium-card gradient-border p-8 rounded-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                    <Input
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-white border-gray-300"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-white border-gray-300"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone *</label>
                      <Input
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-white border-gray-300"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Address *</label>
                    <Input
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="bg-white border-gray-300"
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                      <Input
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">State *</label>
                      <Input
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Pincode *</label>
                      <Input
                        name="pincode"
                        required
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="bg-white border-gray-300"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-7 rounded-2xl shadow-xl animate-pulse-glow"
                  >
                    <CreditCard className="mr-2" size={24} />
                    Place Order - ₹{getCartTotal()}
                  </Button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="premium-card gradient-border p-8 rounded-2xl sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">₹{item.price}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (18%)</span>
                    <span>₹{Math.round(getCartTotal() * 0.18)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="gradient-text">₹{Math.round(getCartTotal() * 1.18)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 text-center">
                    🎉 Free shipping on all orders!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
