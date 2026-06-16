// API Service for Knight Tree Net
// Base URL configuration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Workstations API
export const workstationsAPI = {
  getAll: () => fetchAPI('/workstations'),
  getById: (id) => fetchAPI(`/workstations/${id}`),
  create: (data) => fetchAPI('/workstations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/workstations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/workstations/${id}`, {
    method: 'DELETE',
  }),
  bulkUpdateHourly: (hourly) => fetchAPI('/workstations/bulk/hourly', {
    method: 'PATCH',
    body: JSON.stringify({ hourly }),
  }),
};

// Users API
export const usersAPI = {
  getAll: () => fetchAPI('/users'),
  getById: (id) => fetchAPI(`/users/${id}`),
  create: (data) => fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  }),
  getSessions: (id) => fetchAPI(`/users/${id}/sessions`),
  getOrders: (id) => fetchAPI(`/users/${id}/orders`),
  getTopUps: (id) => fetchAPI(`/users/${id}/topups`),
};

// Sessions API
export const sessionsAPI = {
  getAll: (activeOnly = false) => fetchAPI(`/sessions${activeOnly ? '?active=true' : ''}`),
  getById: (id) => fetchAPI(`/sessions/${id}`),
  create: (data) => fetchAPI('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  end: (id) => fetchAPI(`/sessions/${id}/end`, {
    method: 'PUT',
  }),
  delete: (id) => fetchAPI(`/sessions/${id}`, {
    method: 'DELETE',
  }),
  getOrders: (id) => fetchAPI(`/sessions/${id}/orders`),
};

// Memberships API
export const membershipsAPI = {
  getAll: () => fetchAPI('/memberships'),
};

// Menu Items API
export const menuItemsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/menu-items${query ? '?' + query : ''}`);
  },
  getById: (id) => fetchAPI(`/menu-items/${id}`),
  create: (data) => fetchAPI('/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/menu-items/${id}`, {
    method: 'DELETE',
  }),
  getCategories: () => fetchAPI('/menu-items/meta/categories'),
};

// Orders API
export const ordersAPI = {
  getAll: () => fetchAPI('/orders'),
  getById: (id) => fetchAPI(`/orders/${id}`),
  create: (data) => fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id, status) => fetchAPI(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id) => fetchAPI(`/orders/${id}`, {
    method: 'DELETE',
  }),
};

// Top-Up API
export const topUpAPI = {
  getAll: () => fetchAPI('/top-up'),
  getById: (id) => fetchAPI(`/top-up/${id}`),
  create: (data) => fetchAPI('/top-up', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  void: (id) => fetchAPI(`/top-up/${id}`, {
    method: 'DELETE',
  }),
};

// Staff API
export const staffAPI = {
  getAll: () => fetchAPI('/staff'),
  getById: (id) => fetchAPI(`/staff/${id}`),
  create: (data) => fetchAPI('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updatePassword: (id, password) => fetchAPI(`/staff/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  }),
  delete: (id) => fetchAPI(`/staff/${id}`, {
    method: 'DELETE',
  }),
};

// System Logs API
export const systemLogsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/system-logs${query ? '?' + query : ''}`);
  },
  create: (data) => fetchAPI('/system-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getByRange: (startDate, endDate) =>
    fetchAPI(`/system-logs/range?start_date=${startDate}&end_date=${endDate}`),
};

// Expenses API
export const expensesAPI = {
  getAll: () => fetchAPI('/expenses'),
  getById: (id) => fetchAPI(`/expenses/${id}`),
  create: (data) => fetchAPI('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/expenses/${id}`, {
    method: 'DELETE',
  }),
  getCategories: () => fetchAPI('/expenses/meta/categories'),
  getByRange: (startDate, endDate) => fetchAPI(`/expenses/range/${startDate}/${endDate}`),
  getSummaryByCategory: () => fetchAPI('/expenses/summary/by-category'),
};

// Health Check
export const healthAPI = {
  check: () => fetchAPI('/health'),
};

export default {
  workstations: workstationsAPI,
  users: usersAPI,
  sessions: sessionsAPI,
  memberships: membershipsAPI,
  menuItems: menuItemsAPI,
  orders: ordersAPI,
  topUp: topUpAPI,
  staff: staffAPI,
  systemLogs: systemLogsAPI,
  expenses: expensesAPI,
  health: healthAPI,
};
