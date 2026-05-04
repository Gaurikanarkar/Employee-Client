import React, { useState, useEffect } from 'react';
import { Trash2, Menu } from 'lucide-react';
import { getTasks, deleteTask } from '../services/api';
import Sidebar from '../components/Sidebar';


const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchTasks();
      } catch (err) { alert('Failed to delete task'); }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-800 rounded-lg"><Menu size={24} /></button>
          <h2 className="text-2xl font-bold text-white">All Tasks</h2>
        </header>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-left min-w-[600px]">
            <thead><tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700"><th className="p-4">Task</th><th className="p-4">Assignee</th><th className="p-4">Priority</th><th className="p-4">Status</th><th className="p-4">Deadline</th><th className="p-4">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-700">
              {tasks.map(task => (
                <tr key={task._id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium">{task.title}</td>
                  <td className="p-4 text-gray-300">{task.assignedTo?.name}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{task.priority}</span></td>
                  <td className="p-4 text-gray-300">{task.status}</td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(task._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <p className="p-8 text-center text-gray-500">No tasks found.</p>}
        </div>
      </main>
    </div>
  );
};

export default AdminTasks;