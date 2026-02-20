import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  Home, 
  Bed, 
  ChefHat, 
  Bath, 
  Briefcase,
  X,
  Check,
  Loader2
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

const CatalogPage = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading, sessionToken } = useCustomerAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customRooms, setCustomRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/customer/login?redirect=/catalog');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      loadCart();
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

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Filter products
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.model_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
            <p className="text-gray-600 mt-1">
              Welcome, {customer?.name}! Browse and add products to your rooms.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/customer/cart')}
            className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            data-testid="cart-button"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Cart</span>
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center shadow">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                data-testid="search-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                data-testid="category-filter"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
                data-testid={`product-card-${product.id}`}
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={`${backendUrl}${product.image_url}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center bg-gray-100" 
                    style={{ display: product.image_url ? 'none' : 'flex' }}
                  >
                    <div className="text-center text-gray-400">
                      <Home className="h-12 w-12 mx-auto mb-2" />
                      <span className="text-sm">No Image</span>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-orange-600 uppercase font-medium bg-orange-50 px-2 py-1 rounded">
                      {product.category || 'General'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Model: {product.model_no}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{product.list_price?.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Selection Modal */}
      {showRoomModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Select Room</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Adding: {selectedProduct.name}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowRoomModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {/* Predefined Rooms */}
              <p className="text-sm font-medium text-gray-500 mb-3">PREDEFINED ROOMS</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {DEFAULT_ROOMS.map((room) => {
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.name}
                      onClick={() => addToCartWithRoom(room.name, 'predefined')}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                      data-testid={`room-${room.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">{room.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Rooms */}
              {customRooms.length > 0 && (
                <>
                  <p className="text-sm font-medium text-gray-500 mb-3">YOUR CUSTOM ROOMS</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {customRooms.map((roomName) => (
                      <button
                        key={roomName}
                        onClick={() => addToCartWithRoom(roomName, 'custom')}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                      >
                        <Home className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">{roomName}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Add Custom Room */}
              {showAddRoom ? (
                <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Room</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      data-testid="custom-room-input"
                    />
                    <Button
                      onClick={addCustomRoom}
                      disabled={!newRoomName.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => {
                        setShowAddRoom(false);
                        setNewRoomName('');
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddRoom(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                  data-testid="add-custom-room-btn"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Room
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CatalogPage;
