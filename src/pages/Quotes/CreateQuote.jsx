import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getClients, createQuote } from '../../services/api';

const CreateQuote = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    documentType: 'QTN',
    validUntil: '',
    subject: '',
    category: 'Website',
    projectCode: 'WEB',
    financialYear: '24-25',
    baseModuleRate: 0,
    quantity: 1,
    numberOfPeople: 1,
    additionalItems: []
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await getClients();
      setClients(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, client: data[0]._id }));
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      additionalItems: [...formData.additionalItems, { description: '', amount: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const items = [...formData.additionalItems];
    items.splice(index, 1);
    setFormData({ ...formData, additionalItems: items });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.additionalItems];
    items[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, additionalItems: items });
  };

  const calculateTotal = () => {
    const baseTotal = formData.baseModuleRate * formData.quantity * formData.numberOfPeople;
    const additionalTotal = formData.additionalItems.reduce((sum, item) => sum + item.amount, 0);
    return baseTotal + additionalTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      await createQuote({ ...formData, totalAmount });
      navigate('/admin/clients/quotes');
    } catch (err) {
      console.error('Error creating quote:', err);
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
          <Link to="/admin/clients/quotes" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Quote Details</h2>
        </header>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* CLIENT & PROJECT INFORMATION */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-2">CLIENT & PROJECT INFORMATION</h3>
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
                <label className="block text-gray-400 text-sm mb-2">Document Type *</label>
                <select 
                  required
                  value={formData.documentType}
                  onChange={e => setFormData({...formData, documentType: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="QTN">Quotation (QTN)</option>
                  <option value="PO">Purchase Order (PO)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Valid Until</label>
                <input 
                  type="date"
                  value={formData.validUntil}
                  onChange={e => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Subject *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Website Development Proposal"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
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
                <label className="block text-gray-400 text-sm mb-2">Product / Project Code *</label>
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
              <div>
                <label className="block text-gray-400 text-sm mb-2">Base Module Rate (₹)</label>
                <input 
                  type="number"
                  value={formData.baseModuleRate}
                  onChange={e => setFormData({...formData, baseModuleRate: parseFloat(e.target.value) || 0})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            </div>
          </section>

          {/* ADDITIONAL FUNCTIONALITY / REQUIREMENTS */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
              <h3 className="text-lg font-bold text-indigo-400">ADDITIONAL FUNCTIONALITY / REQUIREMENTS</h3>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
              >
                <Plus size={16} /> Add More
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.additionalItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex-1">
                    <label className="block text-gray-500 text-xs mb-1">Description</label>
                    <input 
                      type="text"
                      placeholder="e.g. Payment Gateway Integration"
                      value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl p-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-gray-500 text-xs mb-1">Amount (₹)</label>
                    <input 
                      type="number"
                      value={item.amount}
                      onChange={e => handleItemChange(index, 'amount', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl p-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(index)}
                    className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {formData.additionalItems.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4 italic">No additional items added.</p>
              )}
            </div>
          </section>

          {/* TOTAL & SUBMIT */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-800/80 p-6 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">Estimated Total Amount</p>
              <p className="text-3xl font-black text-white">₹{calculateTotal().toLocaleString()}</p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black px-10 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50"
            >
              {loading ? 'Generating...' : <><Save size={20} /> Generate Quote</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateQuote;
