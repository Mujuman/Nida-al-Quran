const API_URL = (import.meta.env.VITE_API_URL || 'https://nida-al-quran-api.vercel.app').replace(/\/+$/, '');

export const apiService = {
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

  getSubAdmins: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getCourses: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/courses/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createCourse: async (course) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/courses/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(course),
    });
    return response.json();
  },

  updateCourse: async (courseId, course) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/courses/admin/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(course),
    });
    return response.json();
  },

  archiveCourse: async (courseId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/courses/admin/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deleteCoursePermanently: async (courseId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/courses/admin/${courseId}/permanent`, {
      method: 'DELETE',
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

  toggleSubAdminStatus: async (adminId, isActive) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins/${adminId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    });
    return response.json();
  },

  resetSubAdminPassword: async (adminId, newPassword) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/sub-admins/${adminId}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    return response.json();
  },

  deleteRejectedStudent: async (userId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/rejected`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deleteAllRejectedStudents: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/rejected-students/all`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getAllContacts: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/contacts${query ? `?${query}` : ''}`,
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
      `${API_URL}/api/attendance/student${query ? `?${query}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getAllAttendance: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/attendance${query ? `?${query}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getAttendanceReport: async (filters = {}) => {
    const token = localStorage.getItem('adminToken');
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/api/attendance/report${query ? `?${query}` : ''}`,
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
    if (result.token) {
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminInfo', JSON.stringify(result.admin));
    }
    return result;
  },

  // Teacher Account Management
  getAllTeachers: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/teachers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getTeacherDetails: async (teacherId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateTeacher: async (teacherId, data) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  activateTeacher: async (teacherId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}/activate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deactivateTeacher: async (teacherId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  deleteTeacher: async (teacherId) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
