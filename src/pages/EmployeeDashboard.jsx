import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Bell, LogOut, Clock, AlertCircle, CheckCircle, Calendar, Search, CheckSquare, Menu, X, FileText } from 'lucide-react';
import { getMyTasks, updateTaskStatus } from '../services/api';

const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      // FIX: Check for both '_id' and 'id'
      const userId = userData._id || userData.id;
      console.log("🔍 User ID found:", userId);
      
      setUser({ ...userData, _id: userId }); // Normalize user object
      if (userId) {
        fetchTasks(userId);
      }
    }
  }, []);

  const fetchTasks = async (userId) => {
    setLoading(true);
    try {
      const res = await getMyTasks(userId);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      const userId = user._id || user.id;
      fetchTasks(userId);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'done').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'todo': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'in-progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'done': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 fixed h-full z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><CheckSquare size={20} className="text-white" /></div>
            <h1 className="text-xl font-bold text-white tracking-wide">ServiceSphere</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={24} /></button>
        </div>
        <ul className="space-y-2 flex-1">
          <Link to="/employee/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-all"><LayoutDashboard size={20} /><span className="font-medium text-sm">My Dashboard</span></Link>
          <li className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-all"><Bell size={20} /><span className="font-medium text-sm">Notifications</span></li>
          <Link to="/employee/documentation" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"><FileText size={20} /><span className="font-medium text-sm">Documentation</span></Link>
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

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg"><Menu size={24} /></button>
            <div><h2 className="text-xl md:text-2xl font-bold text-white">My Tasks</h2><p className="text-gray-400 text-sm mt-1 hidden sm:block">Track and manage your assigned tasks</p></div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search tasks..." className="bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 w-full md:w-64" /></div>
            <button className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 relative flex-shrink-0"><Bell size={20} className="text-gray-300" /><span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span></button>
          </div>
        </header>

        {loading ? <p className="text-center text-gray-400 mt-20">Loading your tasks...</p> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-gray-800/50 border border-gray-700 p-4 md:p-6 rounded-2xl"><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs md:text-sm">Total Tasks</p><LayoutDashboard size={18} className="text-indigo-400" /></div><p className="text-2xl md:text-3xl font-bold text-white">{stats.total}</p></div>
              <div className="bg-gray-800/50 border border-gray-700 p-4 md:p-6 rounded-2xl"><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs md:text-sm">To Do</p><Clock size={18} className="text-gray-400" /></div><p className="text-2xl md:text-3xl font-bold text-white">{stats.todo}</p></div>
              <div className="bg-gray-800/50 border border-gray-700 p-4 md:p-6 rounded-2xl"><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs md:text-sm">In Progress</p><AlertCircle size={18} className="text-indigo-400" /></div><p className="text-2xl md:text-3xl font-bold text-white">{stats.inProgress}</p></div>
              <div className="bg-gray-800/50 border border-gray-700 p-4 md:p-6 rounded-2xl"><div className="flex items-center justify-between mb-2"><p className="text-gray-400 text-xs md:text-sm">Completed</p><CheckCircle size={18} className="text-green-400" /></div><p className="text-2xl md:text-3xl font-bold text-white">{stats.completed}</p></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'todo', 'in-progress', 'done'].map((status) => (
                <button key={status} onClick={() => setFilter(status)} className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${filter === status ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {status === 'all' ? 'All Tasks' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16"><div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-gray-600" /></div><p className="text-gray-400">No tasks found</p>{user && <p className="text-xs text-gray-500 mt-2">User ID: {user._id}</p>}</div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task._id} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 md:p-6 hover:border-gray-600 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1"><h3 className="text-base md:text-lg font-semibold text-white mb-2">{task.title}</h3><p className="text-gray-400 text-sm">{task.description}</p></div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>{task.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs md:text-sm text-gray-400 pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2"><Calendar size={16} /><span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                      <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{task.createdBy?.name?.charAt(0)}</div><span>By: {task.createdBy?.name}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {task.status !== 'todo' && <button onClick={() => handleStatusUpdate(task._id, 'todo')} className="px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs md:text-sm rounded-lg transition-colors">Mark as To Do</button>}
                      {task.status !== 'in-progress' && <button onClick={() => handleStatusUpdate(task._id, 'in-progress')} className="px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm rounded-lg transition-colors">Mark In Progress</button>}
                      {task.status !== 'done' && <button onClick={() => handleStatusUpdate(task._id, 'done')} className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs md:text-sm rounded-lg transition-colors">Mark Complete</button>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;