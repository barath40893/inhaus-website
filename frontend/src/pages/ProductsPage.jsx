import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Home, 
  Bed, 
  ChefHat, 
  Bath, 
  Briefcase,
  X,
  Check,
  Loader2,
  LogIn,
  Package,
  Grid3X3,
  List
} from 'lucide-react';

const DEFAULT_ROOMS = [
  { name: 'Living Room', icon: Home },
  { name: 'Master Bedroom', icon: Bed },
  { name: 'Bedroom 2', icon: Bed },
  { name: 'Bedroom 3', icon: Bed },
  { name: 'Kitchen', icon: ChefHat },
  { name: 'Bathroom', icon: Bath },
  { name: 'Office/Study', icon: Briefcase },
  { name: 'Dining Room', icon: Home },
  { name: 'Balcony', icon: Home },
  { name: 'Hall', icon: Home }
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading, sessionToken } = useCustomerAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customRooms, setCustomRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProducts();
    loadCart(); // Always load cart — guests can shop too
    if (isAuthenticated) {
      fetchCustomRooms();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/shop/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomRooms = async () => {
    if (!sessionToken) return;
    try {
      const response = await fetch(`${backendUrl}/api/customer/rooms`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomRooms(data.custom_rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

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

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowRoomModal(true);
  };

  const addToCartWithRoom = (roomName, roomType = 'predefined') => {
    const existingItem = cart.find(
      item => item.product_id === selectedProduct.id && item.room_name === roomName
    );

    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        (item.product_id === selectedProduct.id && item.room_name === roomName)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        model_no: selectedProduct.model_no,
        image_url: selectedProduct.image_url,
        price: selectedProduct.list_price,
        quantity: 1,
        room_name: roomName,
        room_type: roomType
      }];
    }

    saveCart(newCart);
    setShowRoomModal(false);
    setSelectedProduct(null);
  };

  const addCustomRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/api/customer/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ name: newRoomName.trim() })
      });

      if (response.ok) {
        setCustomRooms([...customRooms, newRoomName.trim()]);
        addToCartWithRoom(newRoomName.trim(), 'custom');
        setNewRoomName('');
        setShowAddRoom(false);
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Filter products
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.model_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden" data-testid="products-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6"
            >
              Smart Home Collection
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Smart
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                Devices
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto"
            >
              Discover our curated range of smart products designed to transform any space into an intelligent environment.
            </motion.p>
            
            {/* Cart Summary — always visible */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-4"
            >
              <button
                onClick={() => navigate('/customer/cart')}
                className="relative flex items-center gap-3 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                data-testid="cart-button"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{getCartCount() > 0 ? 'View Cart' : 'Shop Now'}</span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </motion.div>
            
            {isAuthenticated && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-neutral-500 mt-6"
              >
                Welcome, <span className="text-orange-500 font-medium">{customer?.name}</span>
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-4 border-b border-white/5 sticky top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 transition-all"
                data-testid="search-input"
              />
            </div>
            <span className="text-xs text-zinc-500">{filteredProducts.length} products</span>
          </div>
        </div>
      </section>

      {/* Main Layout: Sidebar + Products */}
      <section className="py-8" data-testid="products-grid">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex gap-8">
            {/* Left Sidebar — Category List */}
            <div className="hidden lg:block w-56 shrink-0 sticky top-32 self-start">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-0.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === 'all' ? 'bg-orange-500/10 text-orange-400 border-l-2 border-orange-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  data-testid="category-all"
                >
                  All Products
                  <span className="text-xs text-zinc-600 ml-1">({products.length})</span>
                </button>
                {categories.filter(c => c !== 'all').map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat ? 'bg-orange-500/10 text-orange-400 border-l-2 border-orange-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                      data-testid={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {cat}
                      <span className="text-xs text-zinc-600 ml-1">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Category Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 px-4 py-2">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={() => setSelectedCategory('all')}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-white/5 text-zinc-400'}`}>
                  All
                </button>
                {categories.filter(c => c !== 'all').map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-white/5 text-zinc-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products — Grouped by Category */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="text-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-neutral-400">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-16 text-center max-w-md mx-auto">
                  <Package className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400 text-lg">No products found</p>
                  <p className="text-neutral-600 mt-2">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Group by category */}
                  {(selectedCategory === 'all' ? categories.filter(c => c !== 'all') : [selectedCategory]).map(cat => {
                    const catProducts = filteredProducts.filter(p => p.category === cat);
                    if (catProducts.length === 0) return null;
                    return (
                      <div key={cat}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{cat}</h2>
                          <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{catProducts.length}</span>
                        </div>
                        {/* Product List */}
                        <div className="space-y-3">
                          {catProducts.map((product, index) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                              className="group flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-orange-500/20 hover:bg-white/[0.04] transition-all"
                              data-testid={`product-card-${product.id}`}
                            >
                              {/* Image */}
                              <div className="w-20 h-20 rounded-lg bg-neutral-800/50 overflow-hidden shrink-0">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url.startsWith('http') ? product.image_url : `${backendUrl}${product.image_url}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                  />
                                ) : null}
                                <div className="w-full h-full flex items-center justify-center bg-neutral-800/50" style={{ display: product.image_url ? 'none' : 'flex' }}>
                                  <Package className="h-8 w-8 text-neutral-700" />
                                </div>
                              </div>
                              {/* Name + Description */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">{product.name}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{product.description}</p>
                                {product.model_no && <p className="text-[10px] text-zinc-600 mt-0.5">Model: {product.model_no}</p>}
                              </div>
                              {/* Price */}
                              <div className="text-right shrink-0">
                                <p className="text-base font-bold text-orange-500">
                                  Rs. {product.list_price?.toLocaleString('en-IN')}
                                </p>
                              </div>
                              {/* Add to Cart */}
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-orange-500 text-orange-500 hover:text-white rounded-full text-xs font-semibold transition-all duration-300"
                                data-testid={`add-to-cart-${product.id}`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Custom Solutions?
          </h2>
          <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our products and how we can help you build your smart ecosystem.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 text-white rounded-full font-medium transition-all duration-300"
          >
            Contact Sales
          </button>
        </div>
      </section>

      {/* Login Prompt Modal removed — guests can now add to cart freely.
          Login is enforced at the checkout stage in CustomerCartPage. */}

      {/* Room Selection Modal */}
      {showRoomModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Select Room</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Adding: {selectedProduct.name}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowRoomModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {/* Predefined Rooms */}
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Predefined Rooms</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {DEFAULT_ROOMS.map((room) => {
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.name}
                      onClick={() => addToCartWithRoom(room.name, 'predefined')}
                      className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-left group"
                      data-testid={`room-${room.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{room.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Rooms */}
              {customRooms.length > 0 && (
                <>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Your Custom Rooms</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {customRooms.map((roomName) => (
                      <button
                        key={roomName}
                        onClick={() => addToCartWithRoom(roomName, 'custom')}
                        className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-left group"
                      >
                        <Home className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{roomName}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Add Custom Room */}
              {showAddRoom ? (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <p className="text-sm font-medium text-white mb-2">Add Custom Room</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50"
                      data-testid="custom-room-input"
                    />
                    <button
                      onClick={addCustomRoom}
                      disabled={!newRoomName.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRoom(false);
                        setNewRoomName('');
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-neutral-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddRoom(true)}
                  className="w-full p-3 border-2 border-dashed border-white/10 rounded-xl text-neutral-500 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                  data-testid="add-custom-room-btn"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Room
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductsPage;
