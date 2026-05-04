import React, { useState, useEffect } from 'react';
import { Menu, Trash2, UserPlus } from 'lucide-react';
import { getEmployees, addEmployee, deleteEmployee } from '../services/api';
import Sidebar from '../components/Sidebar';


const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addEmployee(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', department: '' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to add employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
      } catch (err) { alert('Failed'); }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-2xl font-bold text-white">Employees</h2>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"><UserPlus size={18} /> Add Employee</button>
        </header>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Department</th><th className="p-4">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-700">
              {employees.map(emp => (
                <tr key={emp._id} className="hover:bg-gray-700/30">
                  <td className="p-4 font-medium">{emp.name}</td>
                  <td className="p-4 text-gray-400">{emp.email}</td>
                  <td className="p-4 text-gray-400">{emp.department || '-'}</td>
                  <td className="p-4"><button onClick={() => handleDelete(emp._id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Employee Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 p-6">
              <h3 className="text-xl font-bold mb-4">Add New Employee</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <input placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white outline-none" />
                <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white outline-none" />
                <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white outline-none" />
                <input placeholder="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white outline-none" />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEmployees;