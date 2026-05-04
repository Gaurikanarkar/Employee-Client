import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Bell, LogOut, CheckSquare, Menu, X,
  FileText, Upload, Trash2, Download, CheckCircle,
  Clock, AlertCircle, MessageSquare
} from 'lucide-react';
import { getMyDocuments, uploadDocument, deleteDocument, downloadDocument } from '../services/api';

const EmployeeDocumentation = () => {
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ projectName: '', file: null });
  const fileRef = useRef();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      const userId = userData._id || userData.id;
      const normalized = { ...userData, _id: userId };
      setUser(normalized);
      fetchDocs(userId);
    }
  }, []);

  const fetchDocs = async (userId) => {
    setLoading(true);
    try {
      const res = await getMyDocuments(userId);
      setDocs(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.projectName) return alert('Please fill all fields');
    setUploading(true);
    try {
      const data = new FormData();
      data.append('projectName', formData.projectName);
      data.append('userId', user._id);
      data.append('file', formData.file);
      await uploadDocument(data);
      setFormData({ projectName: '', file: null });
      fileRef.current.value = '';
      fetchDocs(user._id);
    } catch (err) {
      alert(err.response?.data?.msg || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      fetchDocs(user._id);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await downloadDocument(doc._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file?.originalName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle size={12} />, label: 'Approved' };
      case 'changes-required':
        return { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <AlertCircle size={12} />, label: 'Changes Required' };
      default:
        return { cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: <Clock size={12} />, label: 'Pending' };
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 fixed h-full z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><CheckSquare size={20} className="text-white" /></div>
            <h1 className="text-xl font-bold text-white tracking-wide">TaskFlow</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={24} /></button>
        </div>
        <ul className="space-y-2 flex-1">
          <Link to="/employee/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"><LayoutDashboard size={20} /><span className="font-medium text-sm">My Dashboard</span></Link>
          <li className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-all"><Bell size={20} /><span className="font-medium text-sm">Notifications</span></li>
          <Link to="/employee/documentation" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"><FileText size={20} /><span className="font-medium text-sm">Documentation</span></Link>
        </ul>
        {user && (
          <div className="bg-gray-800 p-4 rounded-xl mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">{user.name?.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{user.name}</p><p className="text-xs text-indigo-400 capitalize">{user.role}</p></div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full transition-colors"><LogOut size={16} /> Sign out</button>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg"><Menu size={24} /></button>
          <div>
            <h2 className="text-2xl font-bold text-white">My Documentation</h2>
            <p className="text-gray-400 text-sm mt-1">Upload and track your project documents</p>
          </div>
        </header>

        {/* Upload Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Upload size={18} className="text-indigo-400" /> Upload New Document</h3>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Project Name"
              value={formData.projectName}
              onChange={e => setFormData({ ...formData, projectName: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none text-sm"
            />
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,.doc,.docx"
              onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-300 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:cursor-pointer"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          <p className="text-gray-500 text-xs mt-3">Accepted formats: PDF, DOC, DOCX · Max size: 10MB</p>
        </div>

        {/* Documents List */}
        {loading ? (
          <p className="text-center text-gray-400 mt-20">Loading...</p>
        ) : docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><FileText size={32} className="text-gray-600" /></div>
            <p className="text-gray-400">No documents uploaded yet</p>
            <p className="text-gray-500 text-sm mt-1">Upload your first document above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map(doc => {
              const badge = getStatusBadge(doc.status);
              return (
                <div key={doc._id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{doc.projectName}</p>
                        <p className="text-gray-400 text-sm">{doc.file?.originalName} · {formatSize(doc.file?.size)}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${badge.cls}`}>
                        {badge.icon}{badge.label}
                      </span>
                      <button onClick={() => handleDownload(doc)} title="Download" className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"><Download size={17} /></button>
                      <button onClick={() => handleDelete(doc._id)} title="Delete" className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={17} /></button>
                    </div>
                  </div>

                  {/* Admin comment */}
                  {doc.adminComment && (
                    <div className="mt-4 pt-4 border-t border-gray-700 flex items-start gap-3">
                      <MessageSquare size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-400 text-xs font-semibold mb-1">Admin Feedback</p>
                        <p className="text-gray-300 text-sm">{doc.adminComment}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeDocumentation;
