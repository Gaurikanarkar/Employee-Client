import React, { useState, useEffect } from 'react';
import { Search, Plus, Menu, X, Eye, Pencil, Copy, Trash2, Download } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getQuotes, deleteQuote } from '../../services/api';
import { Link } from 'react-router-dom';

const ManageQuotes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter, searchQuery]);

  const fetchQuotes = async () => {
    try {
      const { data } = await getQuotes({ status: statusFilter, search: searchQuery });
      setQuotes(data);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this quote?')) {
      try {
        await deleteQuote(id);
        fetchQuotes();
      } catch (err) {
        console.error('Error deleting quote:', err);
      }
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Quote #,Client,Subject,Amount,Date"].join(",") + "\n"
      + quotes.map(q => `${q.quoteNumber},${q.client?.organization},${q.subject},${q.totalAmount},${new Date(q.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quotes_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg text-gray-400">
              <Menu size={24} />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Manage Quotes</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search quotes..." 
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
            onClick={handleExport}
            className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            <Download size={18} /> Export
          </button>
          <Link 
            to="/admin/clients/quotes/create"
            className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} /> Add
          </Link>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700 bg-gray-800/50">
                  <th className="p-4 font-medium">SR</th>
                  <th className="p-4 font-medium">Quote #</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Created At</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {quotes.map((quote, index) => (
                  <tr key={quote._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-sm text-gray-400">{index + 1}</td>
                    <td className="p-4 text-sm font-semibold text-indigo-400">{quote.quoteNumber}</td>
                    <td className="p-4 text-sm text-gray-300">{quote.client?.organization}</td>
                    <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{quote.subject}</td>
                    <td className="p-4 text-sm font-bold text-white">₹{quote.totalAmount.toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="View">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                          <Pencil size={18} />
                        </button>
                        <button className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Duplicate">
                          <Copy size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(quote._id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {quotes.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No quotes found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageQuotes;
