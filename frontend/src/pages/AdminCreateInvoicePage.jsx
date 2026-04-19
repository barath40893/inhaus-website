import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculator, X, Search, Package, Plus } from 'lucide-react';

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
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" data-testid="close-price-calc-modal-invoice">
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

const AdminCreateInvoicePage = () => {
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
    billing_address: '',
    discount: 0,
    installation_charges: 0,
    gst_percentage: 18,
    due_days: 30,
    amount_paid: 0,
    items: []
  });

  const [newItem, setNewItem] = useState({
    room_area: '',
    model_no: '',
    product_name: '',
    description: '',
    quantity: 1,
    list_price: 0,
    discount: 0,
    offered_price: 0,
    company_cost: 0,
    image_url: null
  });

  useEffect(() => {
    checkAuth();
    fetchProducts();
    if (id) {
      fetchInvoice();
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

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/invoices/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const addItem = () => {
    if (!newItem.room_area || !newItem.model_no || !newItem.product_name) {
      alert('Please fill required fields');
      return;
    }
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem }]
    });
    setNewItem({
      room_area: '',
      model_no: '',
      product_name: '',
      description: '',
      quantity: 1,
      list_price: 0,
      discount: 0,
      offered_price: 0,
      company_cost: 0,
      image_url: null
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  // ── Picker computed filters ──
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
      image_url: product.image_url || null
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.offered_price * item.quantity), 0);
    const net_amount = subtotal - formData.discount;
    const total_before_gst = net_amount + formData.installation_charges;
    const gst_amount = (total_before_gst * formData.gst_percentage) / 100;
    const total = total_before_gst + gst_amount;
    
    return { subtotal, net_amount, gst_amount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item');
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

      const url = id ? `${backendUrl}/api/invoices/${id}` : `${backendUrl}/api/invoices`;
      const method = id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(id ? 'Invoice updated successfully!' : 'Invoice created successfully!');
        navigate('/admin/invoices');
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert('Error: ' + (error.detail || 'Failed to save'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to save invoice: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{id ? 'Edit Invoice' : 'New Invoice'}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPriceCalc(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
              data-testid="open-price-calc-invoice"
            >
              <Calculator size={16} />
              Price Calculator
            </button>
            <button onClick={() => navigate('/admin/invoices')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
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
                <input type="email" required value={formData.customer_email} onChange={(e) => setFormData({...formData, customer_email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input type="text" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Days</label>
                <input type="number" value={formData.due_days} onChange={(e) => setFormData({...formData, due_days: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Customer Address</label>
                <textarea rows="2" value={formData.customer_address} onChange={(e) => setFormData({...formData, customer_address: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Billing Address</label>
                <textarea rows="2" value={formData.billing_address} onChange={(e) => setFormData({...formData, billing_address: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Add Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Items</h2>

            {/* ═══ Product Picker (search + category filter + list) ═══ */}
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden" data-testid="invoice-product-picker">
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
                    data-testid="invoice-picker-search"
                  />
                </div>
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 min-w-[200px]"
                  data-testid="invoice-picker-category"
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
                      <button
                        type="button"
                        onClick={() => selectProduct(p)}
                        className="shrink-0 flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        <Plus size={12} /> Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room/Area*</label>
                <input type="text" value={newItem.room_area} onChange={(e) => setNewItem({...newItem, room_area: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Hall" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model No*</label>
                <input type="text" value={newItem.model_no} onChange={(e) => setNewItem({...newItem, model_no: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
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
                <label className="block text-sm font-medium mb-2">Price*</label>
                <input type="number" step="0.01" value={newItem.offered_price} onChange={(e) => setNewItem({...newItem, offered_price: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Cost*</label>
                <input type="number" step="0.01" value={newItem.company_cost} onChange={(e) => setNewItem({...newItem, company_cost: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="col-span-5">
                <label className="block text-sm font-medium mb-2">Description</label>
                <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={addItem} className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  + Add
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
                        <tr key={idx}>
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
                          <td className="px-4 py-2 text-sm">{item.model_no}</td>
                          <td className="px-4 py-2 text-sm">{item.product_name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">₹{item.offered_price}</td>
                          <td className="px-4 py-2 text-sm">₹{(item.offered_price * item.quantity).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">
                            <button type="button" onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-800">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount</label>
                <input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Installation Charges</label>
                <input type="number" step="0.01" value={formData.installation_charges} onChange={(e) => setFormData({...formData, installation_charges: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GST %</label>
                <input type="number" step="0.01" value={formData.gst_percentage} onChange={(e) => setFormData({...formData, gst_percentage: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right font-medium">Subtotal:</div>
                <div className="text-right">₹ {totals.subtotal.toFixed(2)}</div>
                {formData.discount > 0 && (
                  <>
                    <div className="text-right font-medium">Discount:</div>
                    <div className="text-right text-red-600">- ₹ {formData.discount.toFixed(2)}</div>
                    <div className="text-right font-medium">Net Amount:</div>
                    <div className="text-right">₹ {totals.net_amount.toFixed(2)}</div>
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
              </div>
            </div>

            {/* Payment Tracking */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Payment Tracking</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount Paid (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({...formData, amount_paid: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    data-testid="invoice-amount-paid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Balance Due (₹)</label>
                  <div className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-red-600 font-semibold" data-testid="invoice-balance-due">
                    ₹ {Math.max(0, totals.total - (formData.amount_paid || 0)).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Status</label>
                  <div className={`w-full px-4 py-2 rounded-lg font-semibold text-center ${
                    (formData.amount_paid || 0) >= totals.total && totals.total > 0
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : (formData.amount_paid || 0) > 0
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`} data-testid="invoice-payment-status">
                    {(formData.amount_paid || 0) >= totals.total && totals.total > 0
                      ? 'PAID'
                      : (formData.amount_paid || 0) > 0
                        ? 'PARTIAL'
                        : 'PENDING'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/invoices')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {saving ? 'Saving...' : (id ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
      </form>
    </div>
  );
};

export default AdminCreateInvoicePage;
