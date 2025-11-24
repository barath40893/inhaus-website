import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminCreateQuotationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);

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
      company_cost: 0
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

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

      const url = id ? `${backendUrl}/api/quotations/${id}` : `${backendUrl}/api/quotations`;
      const method = id ? 'PATCH' : 'POST';

      // Log for debugging
      console.log('Submitting quotation:', {
        url,
        method,
        itemCount: formData.items.length,
        hasToken: !!token
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{id ? 'Edit Quotation' : 'New Quotation'}</h1>
          <button onClick={() => navigate('/admin/quotations')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Back
          </button>
        </div>

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
            
            {/* Product Selector */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium mb-2">Quick Select from Product Master</label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {products.map(p => (
                  <button key={p.id} type="button" onClick={() => selectProduct(p)} className="p-2 text-sm border rounded hover:bg-blue-50 text-left">
                    <div className="font-semibold">{p.model_no}</div>
                    <div className="text-xs text-gray-600">{p.name}</div>
                  </button>
                ))}
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
      
      <Footer />
    </div>
  );
};

export default AdminCreateQuotationPage;
