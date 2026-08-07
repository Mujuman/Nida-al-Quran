const API_URL = import.meta.env.VITE_API_URL || 'https://api-nida.vercel.app';

export const apiService = {
  // ========== USER ENDPOINTS ==========
  registerUser: async (userData) => {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  loginUser: async (credentials) => {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // ========== ADMIN AUTH ENDPOINTS ==========
  adminLogin: async (credentials) => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  getDashboardStats: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // ========== USER MANAGEMENT ==========
  getAllUsers: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getUserDetails: async (userId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateUserStatus: async (userId, status) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(status),
    });
    return response.json();
  },

  deleteUser: async (userId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  assignStudentToTeacher: async (userId, teacherId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teacherId }),
    });
    return response.json();
  },

  getMyStudents: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/my-students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // ========== SUB-ADMIN MANAGEMENT ==========
  getSubAdmins: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createSubAdmin: async (data) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateSubAdmin: async (adminId, data) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins/${adminId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteSubAdmin: async (adminId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins/${adminId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // ========== CONTACT ENDPOINTS ==========
  submitContact: async (contactData) => {
    const response = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    return response.json();
  },

  getAllContacts: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/contacts${query ? '?' + query : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getContactById: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  replyContact: async (contactId, reply) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reply }),
    });
    return response.json();
  },

  markContactAsRead: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deleteContact: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  markContactAsSpam: async (contactId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/contacts/${contactId}/spam`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attendanceData),
    });
    return response.json();
  },

  getStudentAttendance: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/attendance/student${query ? '?' + query : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getAllAttendance: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/attendance${query ? '?' + query : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getAttendanceReport: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/attendance/report${query ? '?' + query : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  deleteAttendance: async (attendanceId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/attendance/${attendanceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // ========== TOKEN & ADMIN INFO MANAGEMENT ==========
  saveToken: (token, isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    localStorage.setItem(key, token);
  },

  saveAdminInfo: (adminInfo) => {
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
  },

  getAdminInfo: () => {
    try {
      return JSON.parse(localStorage.getItem('adminInfo')) || null;
    } catch {
      return null;
    }
  },

  getToken: (isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    return localStorage.getItem(key);
  },

  clearToken: (isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    localStorage.removeItem(key);
    if (isAdmin) localStorage.removeItem('adminInfo');
  },

  isAuthenticated: (isAdmin = false) => {
    const key = isAdmin ? 'adminToken' : 'token';
    return !!localStorage.getItem(key);
  },

  isMainAdmin: () => {
    const info = apiService.getAdminInfo();
    return info && info.role === 'main_admin';
  },

  getProfile: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateProfile: async (data) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    // On success, refresh stored token + admin info
    if (result.token) {
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminInfo', JSON.stringify(result.admin));
    }
    return result;
  },
};
