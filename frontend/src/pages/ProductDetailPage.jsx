import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Check, Zap, Shield, Package } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in real app, fetch from API
  const products = {
    'smart-switch-2': {
      id: 'smart-switch-2',
      name: 'NEXA 3 Switch Smart Switch WiFi Switch',
      price: 2999,
      originalPrice: 3999,
      rating: 4.8,
      reviews: 156,
      inStock: true,
      images: [
        'https://customer-assets.emergentagent.com/job_inhaus-ecommerce/artifacts/5u7yf0w4_3modular-BAJASW63-fotor-20251105111152.png',
        'https://customer-assets.emergentagent.com/job_inhaus-ecommerce/artifacts/5u7yf0w4_3modular-BAJASW63-fotor-20251105111152.png',
        'https://customer-assets.emergentagent.com/job_inhaus-ecommerce/artifacts/5u7yf0w4_3modular-BAJASW63-fotor-20251105111152.png',
      ],
      description: 'Retrofit your existing switches for smart control and automation.',
      features: [
        'Voice Control Compatible (Alexa, Google Home, Siri)',
        'Remote Control via Mobile App',
        'Schedule & Timer Functions',
        'Energy Monitoring',
        'LED Indicators',
        'Easy DIY Installation',
        'Premium Build Quality',
        '2-Year Warranty',
      ],
      specifications: {
        'Power Rating': '10A, 2300W',
        'Voltage': 'AC 100-240V',
        'Connectivity': 'WiFi 2.4GHz',
        'Material': 'Tempered Glass + PC',
        'Dimensions': '86mm x 86mm x 35mm',
        'Color': 'White/Black/Gold',
        'Certification': 'CE, FCC, RoHS',
      },
    },
    'smart-bulb': {
      id: 'smart-bulb',
      name: 'InHaus RGB Smart Bulb',
      price: 1499,
      originalPrice: 1999,
      rating: 4.7,
      reviews: 203,
      inStock: true,
      images: [
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
      ],
      description: '16 million color smart LED bulb with voice control and music sync. Create the perfect ambiance for any occasion.',
      features: [
        '16 Million Colors',
        'Voice Control Support',
        'Music Sync Feature',
        'Adjustable Brightness',
        'Schedule & Automation',
        'Energy Efficient LED',
        'Long Life: 25,000 Hours',
        '1-Year Warranty',
      ],
      specifications: {
        'Power': '9W (60W Equivalent)',
        'Luminous Flux': '800 Lumens',
        'Color Temperature': '2700K-6500K',
        'Connectivity': 'WiFi 2.4GHz',
        'Base Type': 'E27',
        'Beam Angle': '220°',
      },
    },
  };

  const product = products[productId] || products['smart-switch-2'];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: 'Added to Cart!',
      description: `${product.name} has been added to your cart.`,
    });
    // Redirect to checkout
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Product Images */}
            <div>
              <div className="mb-4 rounded-2xl overflow-hidden border-2 border-gray-200 premium-card">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-orange-500 scale-105'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
                <span className="text-sm font-semibold text-orange-600">
                  {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? 'fill-orange-500 text-orange-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold gradient-text">₹{product.price}</span>
                  <span className="text-2xl text-gray-400 line-through">₹{product.originalPrice}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{product.description}</p>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xl transition-colors"
                    >
                      -
                    </button>
                    <span className="px-8 py-3 font-bold text-xl">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 animate-pulse-glow"
              >
                <ShoppingCart className="mr-2" size={24} />
                Add to Cart
              </Button>

              {/* Features */}
              <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="text-orange-500 flex-shrink-0" size={20} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Features & Specs */}
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto mt-16">
            <div className="premium-card gradient-border p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">All Features</h2>
              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Zap className="text-orange-500 flex-shrink-0 mt-1" size={18} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card gradient-border p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="font-semibold text-gray-900">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="text-center p-6">
              <Shield className="text-orange-500 mx-auto mb-3" size={40} />
              <h3 className="font-bold text-gray-900 mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center p-6">
              <Package className="text-orange-500 mx-auto mb-3" size={40} />
              <h3 className="font-bold text-gray-900 mb-1">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders above ₹1000</p>
            </div>
            <div className="text-center p-6">
              <Check className="text-orange-500 mx-auto mb-3" size={40} />
              <h3 className="font-bold text-gray-900 mb-1">2-Year Warranty</h3>
              <p className="text-sm text-gray-600">Hassle-free returns</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
