import React, { useState, useEffect } from 'react';
import { Search, Plus, Menu, X, Eye, Pencil, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getClients, createClient, deleteClient } from '../services/api';

const AdminClients = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' or 'inactive'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    organization: '',
    category: 'OTHER',
    contactName: '',
    contactEmail: '',
    status: 'active'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.organization.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          client.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await createClient(formData);
      fetchClients();
      setIsModalOpen(false);
      setFormData({
        organization: '',
        category: 'OTHER',
        contactName: '',
        contactEmail: '',
        status: 'active'
      });
    } catch (err) {
      alert('Failed to add client');
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (err) {
        alert('Failed to delete client');
      }
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'TECHNOLOGY': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'EDUCATION': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8 relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-white">Client</span>{' '}
              <span className="text-indigo-500">Registry</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button 
            onClick={() => setStatusFilter('active')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'active' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter('inactive')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'inactive' 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Inactive
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} /> Add Client
          </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700 bg-gray-800/50">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                  </th>
                  <th className="p-4 font-medium">SR</th>
                  <th className="p-4 font-medium">Organization</th>
                  <th className="p-4 font-medium">Primary Contact</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500">Loading clients...</td>
                  </tr>
                ) : filteredClients.map((client, index) => (
                  <tr key={client._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="p-4 text-sm text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{client.organization}</span>
                        <span className={`w-fit mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(client.category)}`}>
                          {client.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-gray-200 text-sm">{client.contactName}</span>
                        <span className="text-gray-400 text-xs">{client.contactEmail}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="View">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client._id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredClients.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No clients found in {statusFilter} registry.
              </div>
            )}
          </div>
        </div>

        {/* Add Client Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Add New Client</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Organization Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.organization}
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="TECHNOLOGY">Technology</option>
                      <option value="EDUCATION">Education</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Primary Contact Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.contactName}
                    onChange={e => setFormData({...formData, contactName: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Primary Contact Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.contactEmail}
                    onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Save Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminClients;
