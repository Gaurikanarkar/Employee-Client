import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, Save, Info } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getClients, createInvoice, getQuotes } from '../../services/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    quotationRef: '',
    type: 'INV',
    category: 'Website',
    projectCode: 'WEB',
    financialYear: '24-25',
    baseModuleRate: 0,
    quantity: 1,
    numberOfPeople: 1,
    includePaymentMilestone: true
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.client) {
      fetchQuotesByClient(formData.client);
    }
  }, [formData.client]);

  const fetchClients = async () => {
    try {
      const { data } = await getClients();
      setClients(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, client: data[0]._id }));
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchQuotesByClient = async (clientId) => {
    try {
      const { data } = await getQuotes({ status: 'active' });
      const clientQuotes = data.filter(q => q.client?._id === clientId);
      setQuotes(clientQuotes);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    }
  };

  const calculateTotal = () => {
    return formData.baseModuleRate * formData.quantity * formData.numberOfPeople;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      await createInvoice({ ...formData, totalAmount });
      navigate('/admin/clients/invoices');
    } catch (err) {
      console.error('Error creating invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg text-gray-400">
            <Menu size={24} />
          </button>
          <Link to="/admin/clients/invoices" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Invoice Details</h2>
        </header>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* BASIC INFORMATION */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">BASIC INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Client Name *</label>
                <select 
                  required
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                >
                  {clients.map(c => <option key={c._id} value={c._id}>{c.organization}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Invoice Date</label>
                <input 
                  type="date"
                  required
                  value={formData.invoiceDate}
                  onChange={e => setFormData({...formData, invoiceDate: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Quotation ID - Optional</label>
                <select 
                  value={formData.quotationRef}
                  onChange={e => setFormData({...formData, quotationRef: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">None</option>
                  {quotes.map(q => <option key={q._id} value={q._id}>{q.quoteNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Type *</label>
                <select 
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="INV">Tax Invoice (INV)</option>
                  <option value="PI">Proforma Invoice (PI)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Category *</label>
                <select 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Website">Website</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Hosting">Hosting</option>
                  <option value="Communication">Communication</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Project Code *</label>
                <select 
                  required
                  value={formData.projectCode}
                  onChange={e => setFormData({...formData, projectCode: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="WEB">WEB</option>
                  <option value="APP">APP</option>
                  <option value="SaaS">SaaS</option>
                </select>
              </div>
            </div>
          </section>

          {/* ITEMS & CALCULATION */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">ITEMS & CALCULATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Base Module Rate (₹)</label>
                <input 
                  type="number"
                  value={formData.baseModuleRate}
                  onChange={e => setFormData({...formData, baseModuleRate: parseFloat(e.target.value) || 0})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Quantity *</label>
                <input 
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">People</label>
                <input 
                  type="number"
                  value={formData.numberOfPeople}
                  onChange={e => setFormData({...formData, numberOfPeople: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox"
                  id="milestone"
                  checked={formData.includePaymentMilestone}
                  onChange={e => setFormData({...formData, includePaymentMilestone: e.target.checked})}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                />
                <label htmlFor="milestone" className="flex-1 cursor-pointer">
                  <span className="block font-bold text-white">Include Payment Milestone Table on Invoice</span>
                  <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info size={12} /> If unchecked, the 40/40/20 breakdown will be hidden from the printed invoice.
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* TOTAL & SUBMIT */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-800/80 p-6 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">Total Invoice Amount</p>
              <p className="text-3xl font-black text-white">₹{calculateTotal().toLocaleString()}</p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black px-10 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50"
            >
              {loading ? 'Generating...' : <><Save size={20} /> Generate Invoice</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateInvoice;
