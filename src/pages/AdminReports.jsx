import React, { useState, useEffect } from 'react';
import { 
  Users, Folder, Wrench, FileText, 
  IndianRupee, Download, Printer, Filter, 
  CheckCircle, Clock, AlertCircle, Menu
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Sidebar from '../components/Sidebar';
import { 
  getClients, getProjects, getServices, 
  getQuotes, getInvoices, getEmployees 
} from '../services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  'paid': '#10b981', // green
  'unpaid': '#f59e0b', // yellow
  'partial': '#3b82f6', // blue
};

const AdminReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Raw Data
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState('all'); // all, 7days, 30days, year

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        clientsRes, projectsRes, servicesRes, 
        quotesRes, invoicesRes, empRes
      ] = await Promise.all([
        getClients(), getProjects(), getServices(),
        getQuotes(), getInvoices(), getEmployees()
      ]);

      setClients(clientsRes.data || []);
      setProjects(projectsRes.data || []);
      setServices(servicesRes.data || []);
      setQuotes(quotesRes.data.data || quotesRes.data || []);
      setInvoices(invoicesRes.data.data || invoicesRes.data || []);
      setEmployees(empRes.data || []);
    } catch (error) {
      console.error('Failed to fetch report data', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Data Aggregations ---

  // Date filtering logic
  const filterByDate = (items, dateField) => {
    if (dateRange === 'all') return items;
    const now = new Date();
    const past = new Date();
    if (dateRange === '7days') past.setDate(now.getDate() - 7);
    if (dateRange === '30days') past.setDate(now.getDate() - 30);
    if (dateRange === 'year') past.setFullYear(now.getFullYear() - 1);

    return items.filter(item => new Date(item[dateField]) >= past);
  };

  const filteredInvoices = filterByDate(invoices, 'createdAt');
  const filteredQuotes = filterByDate(quotes, 'createdAt');
  const filteredClients = filterByDate(clients, 'createdAt');

  // 1. Top Summary Math
  const totalRevenue = filteredInvoices
    .filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // 2. Revenue Report (Monthly)
  const getMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, revenue: 0 }));
    
    filteredInvoices.forEach(inv => {
      if (inv.paymentStatus === 'paid') {
        const date = new Date(inv.createdAt);
        const monthIndex = date.getMonth();
        if(data[monthIndex]) {
           data[monthIndex].revenue += (inv.totalAmount || 0);
        }
      }
    });
    return data;
  };

  // Invoice Status Pie Chart
  const getInvoiceStatusData = () => {
    const statusCounts = {};
    filteredInvoices.forEach(inv => {
      // default to unpaid if missing
      const status = inv.paymentStatus || 'unpaid';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.keys(statusCounts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), 
      value: statusCounts[key],
      originalKey: key
    }));
  };

  // Export functions
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number,Client,Amount,Payment Status,Date\n'];
    const rows = filteredInvoices.map(inv => {
      const clientName = inv.client?.organization ? `"${inv.client.organization}"` : 'N/A';
      const amount = inv.totalAmount || 0;
      const date = new Date(inv.createdAt).toLocaleDateString();
      const pStatus = inv.paymentStatus || 'unpaid';
      return `${inv.invoiceNumber},${clientName},${amount},${pStatus},${date}`;
    });
    
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-gray-100 items-center justify-center">
        <p className="text-xl text-indigo-400 animate-pulse">Generating Reports...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Header & Filters */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg print:hidden">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h2>
              <p className="text-gray-400 text-sm mt-1 print:hidden">Comprehensive overview of your business</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto print:hidden">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <button onClick={handleExportCSV} className="p-2 bg-green-600/20 text-green-500 hover:bg-green-600/30 rounded-xl transition-colors" title="Export CSV">
              <Download size={20} />
            </button>
            <button onClick={handlePrint} className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-xl transition-colors" title="Print to PDF">
              <Printer size={20} />
            </button>
          </div>
        </header>

        {/* 1. Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard title="Clients" value={filteredClients.length} icon={Users} color="text-blue-400" bg="bg-blue-500/10" />
          <StatCard title="Projects" value={projects.length} icon={Folder} color="text-purple-400" bg="bg-purple-500/10" />
          <StatCard title="Services" value={services.length} icon={Wrench} color="text-amber-400" bg="bg-amber-500/10" />
          <StatCard title="Quotes" value={filteredQuotes.length} icon={FileText} color="text-emerald-400" bg="bg-emerald-500/10" />
          <StatCard title="Invoices" value={filteredInvoices.length} icon={FileText} color="text-pink-400" bg="bg-pink-500/10" />
          <StatCard 
            title="Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            icon={IndianRupee} 
            color="text-indigo-400" 
            bg="bg-indigo-500/10" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 2. Revenue Report Section */}
          <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-2xl p-6 print:break-inside-avoid">
            <h3 className="text-lg font-bold mb-6">Revenue Trend (Monthly)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMonthlyRevenue()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Invoice Status Split */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 print:break-inside-avoid">
            <h3 className="text-lg font-bold mb-6">Invoice Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getInvoiceStatusData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getInvoiceStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.originalKey] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 4. Quotation Report */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 print:break-inside-avoid">
            <h3 className="text-md font-bold mb-4 text-gray-300">Quotations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total</span>
                <span className="font-bold">{filteredQuotes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400">Converted</span>
                <span className="font-bold">{filteredQuotes.filter(q => q.status === 'accepted').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400">Pending</span>
                <span className="font-bold">{filteredQuotes.filter(q => q.status === 'pending').length}</span>
              </div>
            </div>
          </div>

          {/* 5. Client Report */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 print:break-inside-avoid">
            <h3 className="text-md font-bold mb-4 text-gray-300">Clients</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total</span>
                <span className="font-bold">{clients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400">Active</span>
                <span className="font-bold">{clients.filter(c => c.status === 'active').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400">Inactive</span>
                <span className="font-bold">{clients.filter(c => c.status === 'inactive').length}</span>
              </div>
            </div>
          </div>

          {/* 6. Service Report */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 print:break-inside-avoid">
            <h3 className="text-md font-bold mb-4 text-gray-300">Services</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total</span>
                <span className="font-bold">{services.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400">Active</span>
                <span className="font-bold">{services.filter(s => s.status === 'active').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400">Inactive</span>
                <span className="font-bold">{services.filter(s => s.status === 'inactive').length}</span>
              </div>
            </div>
          </div>

          {/* 7 & 8. Project & Employee Report */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 print:break-inside-avoid">
            <h3 className="text-md font-bold mb-4 text-gray-300">Workforce & Projects</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Employees</span>
                <span className="font-bold">{employees.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Projects</span>
                <span className="font-bold">{projects.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400">Active Projects</span>
                <span className="font-bold">{projects.filter(p => p.status === 'active').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Invoice Report Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden print:break-before-page">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-bold">Recent Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700 bg-gray-800/30">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredInvoices.slice(0, 10).map((inv) => {
                  const pStatus = inv.paymentStatus || 'unpaid';
                  return (
                  <tr key={inv._id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="p-4 font-medium text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="p-4 text-white">{inv.client?.organization || 'N/A'}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-white">₹{(inv.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span 
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize`}
                        style={{ 
                          color: STATUS_COLORS[pStatus] || '#9CA3AF',
                          borderColor: `${STATUS_COLORS[pStatus] || '#9CA3AF'}40`,
                          backgroundColor: `${STATUS_COLORS[pStatus] || '#9CA3AF'}15`
                        }}
                      >
                        {pStatus}
                      </span>
                    </td>
                  </tr>
                )})}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No invoices found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-gray-800/50 border border-gray-700 p-5 rounded-2xl print:border-gray-300 print:bg-gray-50">
    <div className="flex items-center justify-between mb-3">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <div className={`p-2 rounded-lg ${bg} ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <h4 className="text-2xl font-bold text-white print:text-black">{value}</h4>
  </div>
);

export default AdminReports;
