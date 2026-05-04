import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Building, 
  LogOut, 
  Activity, 
  X, 
  ChevronDown, 
  ChevronRight,
  Database,
  Folder,
  Wrench,
  FileText
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const path = location.pathname;
  const [mastersExpanded, setMastersExpanded] = useState(false);
  const [clientsExpanded, setClientsExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
  ];

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <aside className={`w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 fixed h-full z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">ServiceSphere</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        <ul className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = path === item.path;
            return (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}

          {/* Clients Section (Accordion) */}
          <li>
            <button 
              onClick={() => setClientsExpanded(!clientsExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                path.includes('/admin/clients')
                  ? 'text-white bg-gray-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building size={20} />
                <span className="font-medium text-sm">Clients</span>
              </div>
              {clientsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {clientsExpanded && (
              <ul className="mt-2 space-y-1 ml-4 border-l border-gray-800 pl-2">
                <li>
                  <Link 
                    to="/admin/clients" 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium ${
                      path === '/admin/clients'
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <Users size={14} />
                    <span>Registry</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/clients/quotes" 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium ${
                      path.includes('/admin/clients/quotes')
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <FileText size={14} />
                    <span>Quotes</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/clients/invoices" 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium ${
                      path.includes('/admin/clients/invoices')
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <Folder size={14} />
                    <span>Invoices</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link 
              to="/admin/employees" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                path === '/admin/employees'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Users size={20} />
              <span className="font-medium text-sm">Employees</span>
            </Link>
          </li>

          <li>
            <Link 
              to="/admin/documentation" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                path === '/admin/documentation'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium text-sm">Documentation</span>
            </Link>
          </li>

          {/* Masters Section */}
          <li>
            <button 
              onClick={() => setMastersExpanded(!mastersExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                path.includes('/admin/masters')
                  ? 'text-white bg-gray-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database size={20} />
                <span className="font-medium text-sm">Masters</span>
              </div>
              {mastersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {mastersExpanded && (
              <ul className="mt-2 space-y-1 ml-4 border-l border-gray-800 pl-2">
                <li>
                  <Link 
                    to="/admin/masters/projects" 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium ${
                      path === '/admin/masters/projects'
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <Folder size={14} />
                    <span>Projects</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/masters/services" 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium ${
                      path === '/admin/masters/services'
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <Wrench size={14} />
                    <span>Services</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>

        <div className="bg-gray-800 p-4 rounded-xl mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin</p>
              <p className="text-xs text-indigo-400">Super Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
