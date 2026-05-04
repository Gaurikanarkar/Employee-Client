import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, FileText, Download, MessageSquare,
  CheckCircle, Clock, AlertCircle, Eye, X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getAllDocuments, updateDocumentStatus, downloadDocument } from '../services/api';

const AdminDocumentation = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null); // for review modal
  const [statusForm, setStatusForm] = useState({ status: '', adminComment: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getAllDocuments();
      setDocs(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const openReview = (doc) => {
    setSelectedDoc(doc);
    setStatusForm({ status: doc.status, adminComment: doc.adminComment || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateDocumentStatus(selectedDoc._id, statusForm);
      setSelectedDoc(null);
      fetchDocs();
    } catch (err) {
      alert('Failed to update');
    } finally {
      setUpdating(false);
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
      alert('Failed to download file');
    }
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
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg"><Menu size={24} /></button>
            <div>
              <h2 className="text-2xl font-bold text-white">Documentation</h2>
              <p className="text-gray-400 text-sm mt-1">Review and approve employee documents</p>
            </div>
          </div>
          {/* Summary badges */}
          <div className="hidden md:flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm">{docs.length} Total</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm">{docs.filter(d => d.status === 'approved').length} Approved</span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-400 text-sm">{docs.filter(d => d.status === 'pending').length} Pending</span>
          </div>
        </header>

        {loading ? (
          <p className="text-center text-gray-400 mt-20">Loading...</p>
        ) : docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><FileText size={32} className="text-gray-600" /></div>
            <p className="text-gray-400">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[750px]">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                    <th className="p-4">Project</th>
                    <th className="p-4">Uploaded By</th>
                    <th className="p-4">File</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Uploaded On</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {docs.map(doc => {
                    const badge = getStatusBadge(doc.status);
                    return (
                      <tr key={doc._id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="p-4 font-medium text-white">{doc.projectName}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(doc.uploadedBy?.name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-gray-200 text-sm">{doc.uploadedBy?.name || '—'}</p>
                              <p className="text-gray-500 text-xs">{doc.uploadedBy?.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-indigo-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm truncate max-w-[160px]">{doc.file?.originalName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">{formatSize(doc.file?.size)}</td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap w-fit ${badge.cls}`}>
                            {badge.icon}{badge.label}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                          {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openReview(doc)} title="Review" className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"><Eye size={17} /></button>
                            <button onClick={() => handleDownload(doc)} title="Download" className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"><Download size={17} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Review Document</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>

            {/* Doc info */}
            <div className="p-6 border-b border-gray-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center"><FileText size={20} className="text-indigo-400" /></div>
                <div>
                  <p className="text-white font-semibold">{selectedDoc.projectName}</p>
                  <p className="text-gray-400 text-sm">{selectedDoc.file?.originalName} · {formatSize(selectedDoc.file?.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {(selectedDoc.uploadedBy?.name || 'U')[0].toUpperCase()}
                </div>
                <span>Uploaded by <span className="text-white">{selectedDoc.uploadedBy?.name || '—'}</span></span>
              </div>
            </div>

            {/* Update form */}
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Update Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'pending', label: 'Pending', cls: 'border-gray-600 text-gray-400', active: 'border-gray-400 bg-gray-700 text-white' },
                    { value: 'approved', label: 'Approved', cls: 'border-gray-600 text-gray-400', active: 'border-green-500 bg-green-500/10 text-green-400' },
                    { value: 'changes-required', label: 'Changes Required', cls: 'border-gray-600 text-gray-400', active: 'border-amber-500 bg-amber-500/10 text-amber-400' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatusForm({ ...statusForm, status: opt.value })}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-center ${statusForm.status === opt.value ? opt.active : opt.cls}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1 flex items-center gap-1"><MessageSquare size={14} /> Comment for Employee</label>
                <textarea
                  value={statusForm.adminComment}
                  onChange={e => setStatusForm({ ...statusForm, adminComment: e.target.value })}
                  placeholder="Add feedback or changes required..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none h-28 resize-none text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedDoc(null)} className="flex-1 py-2.5 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors font-medium text-sm disabled:opacity-50">
                  {updating ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentation;
