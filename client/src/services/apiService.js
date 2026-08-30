const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const apiService = {
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
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('studentUser', JSON.stringify(data.user));
      }
    }
    return data;
  },

  studentLogin: async (credentials) => {
    return apiService.loginUser(credentials);
  },

  getMyProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateMyProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  getMyAttendance: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/me/attendance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getMyCourses: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/me/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getMyTeacher: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/me/teacher`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  getStatistics: async () => {
    const response = await fetch(`${API_URL}/api/users/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  getCourses: async () => {
    const response = await fetch(`${API_URL}/api/courses`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  submitContact: async (contactData) => {
    const response = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    return response.json();
  },

  saveToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentUser');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentUser');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

