const API_URL = (import.meta.env.VITE_API_URL || 'https://api-nida.vercel.app').replace(/\/+$/, '');

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
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
