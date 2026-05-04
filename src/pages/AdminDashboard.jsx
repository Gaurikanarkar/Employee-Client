import React, { useState, useEffect } from 'react';
import { Plus, X, Menu } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTasks, createTask, getEmployees } from '../services/api';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskRes, empRes] = await Promise.all([getTasks(), getEmployees()]);
      setTasks(taskRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'done').length,
    teamMembers: employees.length
  };

  // Pie chart data
  const taskStatusData = [
    { name: 'In Progress', value: stats.inProgress, color: '#6366f1' },
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Todo', value: Math.max(0, stats.total - stats.inProgress - stats.completed), color: '#374151' },
  ];

  // Team performance bar chart data — derived from tasks grouped by employee
  const teamPerformanceData = employees.map(emp => {
    const empId = emp._id || emp.id;
    const assigned = tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo;
      return String(assignedId) === String(empId);
    }).length;
    const completed = tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo;
      return String(assignedId) === String(empId) && t.status === 'done';
    }).length;
    return { name: emp.name, Assigned: assigned, Completed: completed };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assignedTo) { alert("Please select an employee"); return; }
    try {
      await createTask(formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to create task');
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-gray-300">{payload[0].value} tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-xl md:text-2xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap">
              <Plus size={18} /> New Task
            </button>
          </div>
        </header>

        {loading ? <p className="text-center text-gray-400 mt-20">Loading...</p> : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" /><h3 className="text-3xl font-bold text-white mb-1">{stats.total}</h3><p className="text-gray-400 text-sm">Total Tasks</p></div>
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-pink-500" /><h3 className="text-3xl font-bold text-white mb-1">{stats.inProgress}</h3><p className="text-gray-400 text-sm">In Progress</p></div>
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-green-500" /><h3 className="text-3xl font-bold text-white mb-1">{stats.completed}</h3><p className="text-gray-400 text-sm">Completed</p></div>
              <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-amber-500" /><h3 className="text-3xl font-bold text-white mb-1">{stats.teamMembers}</h3><p className="text-gray-400 text-sm">Employees</p></div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Pie Chart — Task Status */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Task Status</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3">
                    {taskStatusData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-300 text-sm">{entry.name}</span>
                        <span className="ml-auto text-white font-semibold text-sm pl-4">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart — Team Performance */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Team Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={teamPerformanceData} barSize={10} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }}
                      itemStyle={{ color: '#d1d5db' }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '12px', fontSize: '12px', color: '#9ca3af' }}
                    />
                    <Bar dataKey="Assigned" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Tasks Table */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Recent Tasks</h3>
                <span className="text-gray-400 text-sm">{tasks.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                      <th className="p-4 font-medium">Task</th>
                      <th className="p-4 font-medium">Assignee</th>
                      <th className="p-4 font-medium">Priority</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {tasks.slice(0, 5).map(task => (
                      <tr key={task._id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="p-4 font-medium text-white">{task.title}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(task.assignedTo?.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-gray-300 text-sm">{task.assignedTo?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>{task.priority}</span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                            task.status === 'in-progress' ? 'text-indigo-400' :
                            task.status === 'done' ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              task.status === 'in-progress' ? 'bg-indigo-400' :
                              task.status === 'done' ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                            {task.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                          {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Create Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Create New Task</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-gray-400 text-sm mb-1">Title</label><input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" /></div>
                <div><label className="block text-gray-400 text-sm mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none h-24 resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-gray-400 text-sm mb-1">Assign To</label><select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"><option value="">Select Employee</option>{employees.map(emp => <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name}</option>)}</select></div>
                  <div><label className="block text-gray-400 text-sm mb-1">Priority</label><select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                </div>
                <div><label className="block text-gray-400 text-sm mb-1">Deadline</label><input type="date" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" /></div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4">Create Task</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;