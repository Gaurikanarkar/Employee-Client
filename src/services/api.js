import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Auth
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// Tasks
export const getTasks = () => API.get('/tasks');
export const getMyTasks = (userId) => API.get(`/tasks/my-tasks?userId=${userId}`);
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTaskStatus = (id, status) => API.put(`/tasks/${id}`, { status });
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
// Add these exports
export const addEmployee = (empData) => API.post('/employees', empData);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);

// Users (for Admin)
export const getEmployees = () => API.get('/users/employees');

// Clients
export const getClients = () => API.get('/clients');
export const createClient = (clientData) => API.post('/clients', clientData);
export const deleteClient = (id) => API.delete(`/clients/${id}`);
export const updateClient = (id, clientData) => API.put(`/clients/${id}`, clientData);

// Projects
export const getProjects = () => API.get('/projects');
export const createProject = (projectData) => API.post('/projects', projectData);
export const updateProject = (id, projectData) => API.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Services
export const getServices = () => API.get('/services');
export const createService = (serviceData) => API.post('/services', serviceData);
export const updateService = (id, serviceData) => API.put(`/services/${id}`, serviceData);
export const deleteService = (id) => API.delete(`/services/${id}`);

// Quotes
export const getQuotes = (params) => API.get('/quotes', { params });
export const createQuote = (quoteData) => API.post('/quotes', quoteData);
export const getQuoteById = (id) => API.get(`/quotes/${id}`);
export const updateQuote = (id, quoteData) => API.put(`/quotes/${id}`, quoteData);
export const deleteQuote = (id) => API.delete(`/quotes/${id}`);

// Invoices
export const getInvoices = (params) => API.get('/invoices', { params });
export const createInvoice = (invoiceData) => API.post('/invoices', invoiceData);
export const getInvoiceById = (id) => API.get(`/invoices/${id}`);
export const updateInvoice = (id, invoiceData) => API.put(`/invoices/${id}`, invoiceData);
export const deleteInvoice = (id) => API.delete(`/invoices/${id}`);

// Documentation
export const getAllDocuments = () => API.get('/documents');
export const getMyDocuments = (userId) => API.get(`/documents/my-documents?userId=${userId}`);
export const uploadDocument = (data) => API.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDocumentStatus = (id, data) => API.put(`/documents/${id}/status`, data);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const downloadDocument = (id) => API.get(`/documents/${id}/download`, { responseType: 'blob' });

export default API;