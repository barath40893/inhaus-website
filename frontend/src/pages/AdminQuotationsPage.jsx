import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const AdminQuotationsPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkAuth();
    fetchQuotations();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/quotations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuotations(data);
      } else if (response.status === 401) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (quotationId) => {
    if (!window.confirm('Send this quotation to the customer via email?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/quotations/${quotationId}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.email_sent) {
          alert('Quotation sent successfully via email!');
        } else {
          alert(`PDF generated but email failed:\n${result.error}\n\nPlease download and send manually.`);
        }
        fetchQuotations();
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert('Failed to send quotation: ' + (error.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert(`Failed to send quotation: ${error.message}`);
    }
  };

  const downloadPDF = async (quotationId, quoteNumber) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/quotations/${quotationId}/download-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotation_${quoteNumber.replace('/', '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('PDF downloaded successfully!');
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        const errorText = await response.text();
        console.error('Download error:', errorText);
        alert(`Failed to download PDF: ${response.status} - ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
    }
  };

  const deleteQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/quotations/${quotationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Quotation deleted successfully!');
        fetchQuotations();
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        const errorText = await response.text();
        alert(`Failed to delete quotation: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert(`Failed to delete quotation: ${error.message}`);
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
              <p className="text-gray-600 mt-2">Manage customer quotations</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/admin/contacts')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Contacts
              </button>
              <button
                onClick={() => navigate('/admin/invoices')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Invoices
              </button>
              <button
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Products
              </button>
              <button
                onClick={() => navigate('/admin/settings')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Settings
              </button>
              <button
                onClick={() => navigate('/admin/quotations/new')}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                + New Quotation
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by customer name, email, or quote number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>

          {/* Quotations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No quotations found</p>
              <button
                onClick={() => navigate('/admin/quotations/new')}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Create Your First Quotation
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quotation.quote_number}</div>
                        <div className="text-xs text-gray-500">Rev: {quotation.revision_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{quotation.customer_name}</div>
                        <div className="text-xs text-gray-500">{quotation.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹ {quotation.total.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600">₹ {quotation.profit_margin.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quotation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/quotations/edit/${quotation.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => downloadPDF(quotation.id, quotation.quote_number)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => sendEmail(quotation.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => deleteQuotation(quotation.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminQuotationsPage;