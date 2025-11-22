import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { LogOut, Search, Download, Mail, Phone, Calendar, Filter, Eye, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminContactsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchContacts();
  }, [navigate]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/contact`);
      setContacts(response.data);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch contacts',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const updateStatus = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(
        `${API}/contact/${contactId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContacts(contacts.map(c =>
        c.id === contactId ? { ...c, status: newStatus } : c
      ));

      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredContacts.map(c =>
        [
          new Date(c.timestamp).toLocaleDateString(),
          c.name,
          c.email,
          c.phone || '',
          `"${c.message.replace(/"/g, '""')}"`,
          c.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inhaus-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
            <p className="text-sm text-gray-600">Manage customer inquiries</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.status === 'new').length}
                  </p>
                  <p className="text-sm text-gray-600">New</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Eye className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.status === 'read').length}
                  </p>
                  <p className="text-sm text-gray-600">Read</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.status === 'responded').length}
                  </p>
                  <p className="text-sm text-gray-600">Responded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                </select>

                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No contacts found
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(contact.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contact.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {contact.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedContact(contact)}
                            >
                              View
                            </Button>
                            {contact.status === 'new' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(contact.id, 'read')}
                              >
                                Mark Read
                              </Button>
                            )}
                            {contact.status === 'read' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateStatus(contact.id, 'responded')}
                              >
                                Mark Responded
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg text-gray-900">{selectedContact.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg text-gray-900">{selectedContact.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg text-gray-900">{selectedContact.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted On</label>
                  <p className="text-lg text-gray-900">
                    {new Date(selectedContact.timestamp).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg mt-2 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedContact.status !== 'responded' && (
                    <>
                      {selectedContact.status === 'new' && (
                        <Button
                          onClick={() => {
                            updateStatus(selectedContact.id, 'read');
                            setSelectedContact({ ...selectedContact, status: 'read' });
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          updateStatus(selectedContact.id, 'responded');
                          setSelectedContact(null);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark as Responded
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminContactsPage;
