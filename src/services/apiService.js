const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiService = {
  // ========== USER ENDPOINTS ==========
  registerUser: async (userData) => {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  loginUser: async (credentials) => {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // ========== ADMIN ENDPOINTS ==========
  adminLogin: async (credentials) => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getDashboardStats: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAllUsers: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getUserDetails: async (userId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateUserStatus: async (userId, status) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(status),
    });
    return response.json();
  },

  // ========== CONTACT ENDPOINTS ==========
  submitContact: async (contactData) => {
    const response = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    return response.json();
  },

  getAllContacts: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/contacts${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getContactById: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  replyContact: async (contactId, reply) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reply }),
    });
    return response.json();
  },

  markContactAsRead: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  deleteContact: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // ========== ATTENDANCE ENDPOINTS ==========
  markAttendance: async (attendanceData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(attendanceData),
    });
    return response.json();
  },

  bulkMarkAttendance: async (attendanceData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/attendance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(attendanceData),
    });
    return response.json();
  },

  getStudentAttendance: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/attendance/student${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAttendanceByCourse: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/attendance/course${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAttendanceReport: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/attendance/report${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAllAttendance: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/attendance${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  deleteAttendance: async (attendanceId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/attendance/${attendanceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // ========== TOKEN MANAGEMENT ==========
  saveToken: (token, isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    localStorage.setItem(key, token);
  },

  getToken: (isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    return localStorage.getItem(key);
  },

  clearToken: (isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    localStorage.removeItem(key);
  },

  isAuthenticated: (isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    return !!localStorage.getItem(key);
  },
};
