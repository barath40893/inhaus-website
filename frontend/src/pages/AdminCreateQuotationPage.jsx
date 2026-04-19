import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculator, X, Search, Package, Plus, Edit3 } from 'lucide-react';

const PriceCalculatorModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Calculator size={18} />
            <span>Price Calculator</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" data-testid="close-price-calc-modal">
            <X size={20} />
          </button>
        </div>
        <iframe
          src="https://price-calc-18.preview.emergentagent.com/embed"
          width="420"
          height="440"
          frameBorder="0"
          style={{ borderRadius: '0 0 12px 12px', display: 'block' }}
          title="Price Calculator"
        />
      </div>
    </div>
  );
};

const AdminCreateQuotationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPriceCalc, setShowPriceCalc] = useState(false);

  // Product picker filters
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    architect_name: '',
    site_location: '',
    overall_discount: 0,
    installation_charges: 0,
    gst_percentage: 18,
    validity_days: 15,
    payment_terms: '50% advance, 50% before dispatch',
    terms_conditions: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    room_area: '',
    switchboard_name: '',
    model_no: '',
    product_name: '',
    description: '',
    quantity: 1,
    list_price: 0,
    discount: 0,
    offered_price: 0,
    company_cost: 0,
    image_url: null,
    is_custom: false
  });
  
  const [editMode, setEditMode] = useState(false); // For clone and edit
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchProducts();
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/quotations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
    }
  };

  const addItem = () => {
    if (!newItem.room_area || !newItem.model_no || !newItem.product_name) {
      alert('Please fill required fields');
      return;
    }
    if (editingItemIndex !== null) {
      // Update existing item
      const updatedItems = [...formData.items];
      updatedItems[editingItemIndex] = { ...newItem };
      setFormData({
        ...formData,
        items: updatedItems
      });
      setEditingItemIndex(null);
    } else {
      // Add new item
      setFormData({
        ...formData,
        items: [...formData.items, { ...newItem }]
      });
    }
    setNewItem({
      room_area: '',
      switchboard_name: '',
      model_no: '',
      product_name: '',
      description: '',
      quantity: 1,
      list_price: 0,
      discount: 0,
      offered_price: 0,
      company_cost: 0,
      image_url: null,
      is_custom: false
    });
    setEditMode(false);
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  // ── Picker computed filters ──────────────────────────────────────
  const pickerCategories = useMemo(() => {
    const counts = {};
    for (const p of products) {
      const c = p.category || 'Uncategorized';
      counts[c] = (counts[c] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredPickerProducts = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = pickerCategory === 'All' || (p.category || 'Uncategorized') === pickerCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.model_no?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
  }, [products, pickerSearch, pickerCategory]);

  const selectProduct = (product) => {
    setNewItem({
      ...newItem,
      model_no: product.model_no,
      product_name: product.name,
      description: product.description,
      list_price: product.list_price,
      offered_price: product.list_price,
      company_cost: product.company_cost,
      image_url: product.image_url || null,
      is_custom: false
    });
  };
  
  const cloneAndEditProduct = (product) => {
    setNewItem({
      ...newItem,
      model_no: product.model_no + ' (Custom)',
      product_name: product.name,
      description: product.description,
      list_price: product.list_price,
      offered_price: product.list_price,
      company_cost: product.company_cost,
      image_url: product.image_url || null,
      is_custom: true
    });
    setEditMode(true);
  };
  
  const editExistingItem = (index) => {
    const item = formData.items[index];
    setNewItem({
      room_area: item.room_area,
      switchboard_name: item.switchboard_name || '',
      model_no: item.model_no,
      product_name: item.product_name,
      description: item.description,
      quantity: item.quantity,
      list_price: item.list_price,
      discount: item.discount,
      offered_price: item.offered_price,
      company_cost: item.company_cost,
      image_url: item.image_url,
      is_custom: item.is_custom || false
    });
    setEditingItemIndex(index);
    setEditMode(true);
  };
  
  const cancelEdit = () => {
    setNewItem({
      room_area: '',
      switchboard_name: '',
      model_no: '',
      product_name: '',
      description: '',
      quantity: 1,
      list_price: 0,
      discount: 0,
      offered_price: 0,
      company_cost: 0,
      image_url: null,
      is_custom: false
    });
    setEditMode(false);
    setEditingItemIndex(null);
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.offered_price * item.quantity), 0);
    const net_quote = subtotal - formData.overall_discount;
    const total_before_gst = net_quote + formData.installation_charges;
    const gst_amount = (total_before_gst * formData.gst_percentage) / 100;
    const total = total_before_gst + gst_amount;
    const company_cost = formData.items.reduce((sum, item) => sum + (item.company_cost * item.quantity), 0);
    const profit = total - company_cost - gst_amount;
    
    return { subtotal, net_quote, gst_amount, total, profit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email)) {
      alert('Please enter a valid email address (e.g., customer@example.com)');
      return;
    }
    
    // Validate items
    if (formData.items.length === 0) {
      alert('Please add at least one product to the quotation');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const url = id ? `${backendUrl}/api/quotations/${id}` : `${backendUrl}/api/quotations`;
      const method = id ? 'PATCH' : 'POST';

      // Log for debugging
      console.log('Submitting quotation:', {
        url,
        method,
        itemCount: formData.items.length,
        hasToken: !!token,
        email: formData.customer_email
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(id ? 'Quotation updated successfully!' : 'Quotation created successfully!');
        navigate('/admin/quotations');
      } else {
        // Read response body only once to avoid clone errors
        let errorData = null;
        try {
          const responseText = await response.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = { detail: 'Unknown error occurred' };
        }

        if (response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else if (response.status === 422) {
          // Validation error
          console.error('Validation error details:', errorData);
          
          let errorMsg = 'Validation error:\n';
          if (errorData.detail && Array.isArray(errorData.detail)) {
            errorMsg += errorData.detail.map(e => {
              const field = e.loc ? e.loc.join('.') : 'unknown field';
              return `• ${field}: ${e.msg}`;
            }).join('\n');
          } else if (errorData.detail) {
            errorMsg += errorData.detail;
          } else {
            errorMsg += 'Please check all fields are filled correctly';
          }
          
          if (errorData.body) {
            console.error('Request body:', errorData.body);
          }
          
          alert(errorMsg);
        } else {
          alert('Error: ' + (errorData.detail || 'Failed to save quotation'));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to save quotation: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{id ? 'Edit Quotation' : 'New Quotation'}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPriceCalc(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
              data-testid="open-price-calc-quotation"
            >
              <Calculator size={16} />
              Price Calculator
            </button>
            <button onClick={() => navigate('/admin/quotations')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Back
            </button>
          </div>
        </div>

        <PriceCalculatorModal isOpen={showPriceCalc} onClose={() => setShowPriceCalc(false)} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name*</label>
                <input type="text" required value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email*</label>
                <input 
                  type="email" 
                  required 
                  placeholder="customer@example.com"
                  value={formData.customer_email} 
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Please enter a valid email address (e.g., customer@example.com)"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a valid email (e.g., customer@example.com)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input type="text" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Architect Name</label>
                <input type="text" value={formData.architect_name} onChange={(e) => setFormData({...formData, architect_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea rows="2" value={formData.customer_address} onChange={(e) => setFormData({...formData, customer_address: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Site Location</label>
                <input type="text" value={formData.site_location} onChange={(e) => setFormData({...formData, site_location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Add Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Items</h2>

            {/* ═══ Product Picker (search + category filter + list) ═══ */}
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden" data-testid="quote-product-picker">
              {/* Toolbar */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search by name, model no, or description…"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    data-testid="quote-picker-search"
                  />
                </div>
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 min-w-[200px]"
                  data-testid="quote-picker-category"
                >
                  <option value="All">All Categories ({products.length})</option>
                  {pickerCategories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                  ))}
                </select>
                <div className="text-xs text-gray-600 whitespace-nowrap">
                  <span className="font-bold text-gray-900">{filteredPickerProducts.length}</span> matching
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                {filteredPickerProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No products match your filter
                  </div>
                ) : (
                  filteredPickerProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-orange-50/30 transition-colors">
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image_url ? (
                          <img
                            src={p.image_url.startsWith('http') ? p.image_url : `${backendUrl}${p.image_url}`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Package size={22} className="text-gray-300" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h4>
                          {p.category && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {p.category.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{p.model_no}</div>
                        <div className="text-xs font-semibold text-orange-600 mt-0.5">₹ {p.list_price?.toLocaleString('en-IN')}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => selectProduct(p)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                          data-testid={`quote-picker-use-${p.id}`}
                          title="Add to quotation as-is"
                        >
                          <Plus size={12} /> Use
                        </button>
                        <button
                          type="button"
                          onClick={() => cloneAndEditProduct(p)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                          title="Clone and edit before adding"
                        >
                          <Edit3 size={12} /> Clone
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {editMode && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium text-orange-800">
                  {editingItemIndex !== null ? '✏️ Editing Item' : '🔧 Custom Product Mode'}
                </span>
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room/Area*</label>
                <input type="text" value={newItem.room_area} onChange={(e) => setNewItem({...newItem, room_area: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Hall" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Switchboard Name</label>
                <input 
                  type="text" 
                  value={newItem.switchboard_name} 
                  onChange={(e) => setNewItem({...newItem, switchboard_name: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  placeholder="4 Modular, Main Board" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model No*</label>
                <input 
                  type="text" 
                  value={newItem.model_no} 
                  onChange={(e) => setNewItem({...newItem, model_no: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  disabled={!editMode && !newItem.is_custom}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Product Name*</label>
                <input type="text" value={newItem.product_name} onChange={(e) => setNewItem({...newItem, product_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Qty*</label>
                <input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">List Price</label>
                <input type="number" step="0.01" value={newItem.list_price} onChange={(e) => setNewItem({...newItem, list_price: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount</label>
                <input type="number" step="0.01" value={newItem.discount} onChange={(e) => setNewItem({...newItem, discount: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Offered Price*</label>
                <input type="number" step="0.01" value={newItem.offered_price} onChange={(e) => setNewItem({...newItem, offered_price: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Cost*</label>
                <input type="number" step="0.01" value={newItem.company_cost} onChange={(e) => setNewItem({...newItem, company_cost: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-2">Description</label>
                <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex items-end">
                <button 
                  type="button" 
                  onClick={addItem} 
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingItemIndex !== null ? '✓ Update Item' : '+ Add Item'}
                </button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Items Added:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Image</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Room</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Switchboard</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Model</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className={item.is_custom ? 'bg-orange-50' : ''}>
                          <td className="px-4 py-2">
                            {item.image_url ? (
                              <img
                                src={item.image_url?.startsWith('http') ? item.image_url : `${backendUrl}${item.image_url}`}
                                alt={item.product_name}
                                className="w-10 h-10 object-cover rounded border"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs ${item.image_url ? 'hidden' : 'flex'}`}>
                              N/A
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">{item.room_area}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {item.switchboard_name || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.model_no}
                            {item.is_custom && <span className="ml-1 text-xs text-orange-600">✏️</span>}
                          </td>
                          <td className="px-4 py-2 text-sm">{item.product_name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">₹{item.offered_price}</td>
                          <td className="px-4 py-2 text-sm">₹{(item.offered_price * item.quantity).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => editExistingItem(idx)} 
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button 
                                type="button" 
                                onClick={() => removeItem(idx)} 
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Terms */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing & Terms</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Overall Discount</label>
                <input type="number" step="0.01" value={formData.overall_discount} onChange={(e) => setFormData({...formData, overall_discount: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Installation Charges</label>
                <input type="number" step="0.01" value={formData.installation_charges} onChange={(e) => setFormData({...formData, installation_charges: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GST %</label>
                <input type="number" step="0.01" value={formData.gst_percentage} onChange={(e) => setFormData({...formData, gst_percentage: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Validity Days</label>
                <input type="number" value={formData.validity_days} onChange={(e) => setFormData({...formData, validity_days: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Payment Terms</label>
                <input type="text" value={formData.payment_terms} onChange={(e) => setFormData({...formData, payment_terms: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                <textarea rows="3" value={formData.terms_conditions} onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right font-medium">Subtotal:</div>
                <div className="text-right">₹ {totals.subtotal.toFixed(2)}</div>
                {formData.overall_discount > 0 && (
                  <>
                    <div className="text-right font-medium">Discount:</div>
                    <div className="text-right text-red-600">- ₹ {formData.overall_discount.toFixed(2)}</div>
                    <div className="text-right font-medium">Net Quote:</div>
                    <div className="text-right">₹ {totals.net_quote.toFixed(2)}</div>
                  </>
                )}
                {formData.installation_charges > 0 && (
                  <>
                    <div className="text-right font-medium">Installation:</div>
                    <div className="text-right">₹ {formData.installation_charges.toFixed(2)}</div>
                  </>
                )}
                <div className="text-right font-medium">GST ({formData.gst_percentage}%):</div>
                <div className="text-right">₹ {totals.gst_amount.toFixed(2)}</div>
                <div className="text-right text-lg font-bold border-t pt-2">TOTAL:</div>
                <div className="text-right text-lg font-bold border-t pt-2">₹ {totals.total.toFixed(2)}</div>
                <div className="text-right font-medium text-green-600">Profit Margin:</div>
                <div className="text-right text-green-600">₹ {totals.profit.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/quotations')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {saving ? 'Saving...' : (id ? 'Update Quotation' : 'Create Quotation')}
            </button>
          </div>
      </form>
    </div>
  );
};

export default AdminCreateQuotationPage;
