import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminTasks from './pages/AdminTasks';
import AdminEmployees from './pages/AdminEmployees';
import AdminClients from './pages/AdminClients';
import AdminProjects from './pages/AdminProjects';
import AdminServices from './pages/AdminServices';
import ManageQuotes from './pages/Quotes/ManageQuotes';
import CreateQuote from './pages/Quotes/CreateQuote';
import ManageInvoices from './pages/Invoices/ManageInvoices';
import CreateInvoice from './pages/Invoices/CreateInvoice';
import AdminDocumentation from './pages/AdminDocumentation';
import EmployeeDocumentation from './pages/EmployeeDocumentation';
import AdminReports from './pages/AdminReports';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/tasks" element={<ProtectedRoute allowedRole="admin"><AdminTasks /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute allowedRole="admin"><AdminEmployees /></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute allowedRole="admin"><AdminClients /></ProtectedRoute>} />
        <Route path="/admin/masters/projects" element={<ProtectedRoute allowedRole="admin"><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/masters/services" element={<ProtectedRoute allowedRole="admin"><AdminServices /></ProtectedRoute>} />
        
        <Route path="/admin/clients/quotes" element={<ProtectedRoute allowedRole="admin"><ManageQuotes /></ProtectedRoute>} />
        <Route path="/admin/clients/quotes/create" element={<ProtectedRoute allowedRole="admin"><CreateQuote /></ProtectedRoute>} />
        <Route path="/admin/clients/invoices" element={<ProtectedRoute allowedRole="admin"><ManageInvoices /></ProtectedRoute>} />
        <Route path="/admin/clients/invoices/create" element={<ProtectedRoute allowedRole="admin"><CreateInvoice /></ProtectedRoute>} />
        
        <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/documentation" element={<ProtectedRoute allowedRole="admin"><AdminDocumentation /></ProtectedRoute>} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employee/documentation" 
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDocumentation />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;