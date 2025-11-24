import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [settings, setSettings] = useState({
    company_name: 'InHaus Smart Automation',
    company_address: 'Shop No 207, 1st Floor, Kokapet Terminal, Gandipet, Hyderabad - 500075',
    company_email: 'support@inhaus.co.in',
    company_phone: '+91 7416925607',
    company_website: 'www.inhaus.co.in',
    company_gstin: '36AAICI44681ZL',
    company_cin: '',
    bank_name: '',
    bank_account_no: '',
    bank_ifsc: '',
    bank_branch: '',
    upi_id: '',
    terms_template: '',
    warranty_info: ''
  });

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 401) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.detail || 'Failed to save settings'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
              <p className="text-gray-600 mt-2">Manage company information for quotations and invoices</p>
            </div>
            <button
              onClick={() => navigate('/admin/quotations')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Quotations
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Company Info */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Company Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name*</label>
                    <input
                      type="text"
                      required
                      value={settings.company_name}
                      onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email*</label>
                    <input
                      type="email"
                      required
                      value={settings.company_email}
                      onChange={(e) => setSettings({...settings, company_email: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone*</label>
                    <input
                      type="text"
                      required
                      value={settings.company_phone}
                      onChange={(e) => setSettings({...settings, company_phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="text"
                      value={settings.company_website}
                      onChange={(e) => setSettings({...settings, company_website: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea
                      rows="2"
                      value={settings.company_address}
                      onChange={(e) => setSettings({...settings, company_address: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">GSTIN</label>
                    <input
                      type="text"
                      value={settings.company_gstin}
                      onChange={(e) => setSettings({...settings, company_gstin: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CIN</label>
                    <input
                      type="text"
                      value={settings.company_cin}
                      onChange={(e) => setSettings({...settings, company_cin: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={settings.bank_name}
                      onChange={(e) => setSettings({...settings, bank_name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      value={settings.bank_account_no}
                      onChange={(e) => setSettings({...settings, bank_account_no: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">IFSC Code</label>
                    <input
                      type="text"
                      value={settings.bank_ifsc}
                      onChange={(e) => setSettings({...settings, bank_ifsc: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Branch</label>
                    <input
                      type="text"
                      value={settings.bank_branch}
                      onChange={(e) => setSettings({...settings, bank_branch: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={settings.upi_id}
                      onChange={(e) => setSettings({...settings, upi_id: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Warranty */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Terms & Warranty</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Terms & Conditions Template</label>
                    <textarea
                      rows="4"
                      value={settings.terms_template}
                      onChange={(e) => setSettings({...settings, terms_template: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter default terms and conditions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Warranty Information</label>
                    <textarea
                      rows="3"
                      value={settings.warranty_info}
                      onChange={(e) => setSettings({...settings, warranty_info: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter warranty information..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/admin/quotations')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminSettingsPage;