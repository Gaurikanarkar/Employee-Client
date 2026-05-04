import React, { useState, useEffect } from 'react';
import { Search, Plus, Menu, X, Eye, Pencil, Trash2, Download, Power } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getProjects, createProject, updateProject, deleteProject, getClients } from '../services/api';

const AdminProjects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    unit: 'Hour',
    qty: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await getClients();
      setClients(data);
      if (data.length > 0 && !formData.client) {
        setFormData(prev => ({ ...prev, client: data[0].organization }));
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ 
      name: '', 
      client: clients.length > 0 ? clients[0].organization : '', 
      unit: 'Hour', 
      qty: 0, 
      status: 'active' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingId(project._id);
    setFormData({
      name: project.name,
      client: project.client,
      unit: project.unit,
      qty: project.qty,
      status: project.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProject(editingId, formData);
      } else {
        await createProject(formData);
      }
      fetchProjects();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  const handleToggleStatus = async (project) => {
    try {
      const newStatus = project.status === 'active' ? 'inactive' : 'active';
      await updateProject(project._id, { status: newStatus });
      fetchProjects();
    } catch (err) {
      console.error('Error toggling status:', err);
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
              <span className="text-white">Project</span>{' '}
              <span className="text-indigo-500">Master</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
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
          <button className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all">
            <Download size={18} /> Export
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} /> Add
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
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Unit</th>
                  <th className="p-4 font-medium text-center">Qty</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProjects.map((project, index) => (
                  <tr key={project._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="p-4 text-sm text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <span className="font-semibold text-white">{project.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 text-sm">{project.client}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm">{project.unit}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-gray-400 text-sm">{project.qty}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(project)}
                          className={`p-2 rounded-lg transition-colors ${
                            project.status === 'active' 
                              ? 'text-red-400 hover:bg-red-500/10' 
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={project.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(project)}
                          className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project._id)}
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
            {filteredProjects.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No projects found in {statusFilter} master.
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Project' : 'Add Project'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Project Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Client</label>
                  <select 
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                  >
                    {clients.map(client => (
                      <option key={client._id} value={client.organization}>
                        {client.organization}
                      </option>
                    ))}
                    {clients.length === 0 && <option value="">No Clients Found</option>}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Unit</label>
                    <select 
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                    >
                      <option value="Hour">Hour</option>
                      <option value="Fix">Fix</option>
                      <option value="Month">Month</option>
                      <option value="Year">Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Quantity</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.qty}
                      onChange={e => setFormData({...formData, qty: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" 
                    />
                  </div>
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
                    {editingId ? 'Update Project' : 'Save Project'}
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

export default AdminProjects;
