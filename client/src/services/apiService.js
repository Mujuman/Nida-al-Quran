const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

console.log(`🌐 API URL configured as: ${API_URL}`);

export const apiService = {
  registerUser: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Register error:', error.message);
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/verify-email?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Verify email error:', error.message);
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await fetch(`${API_URL}/api/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Verify OTP error:', error.message);
      throw error;
    }
  },

  resendOtp: async (email) => {
    try {
      console.log(`📧 Sending resend OTP request for: ${email}`);
      const response = await fetch(`${API_URL}/api/users/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        console.error(`❌ Resend OTP failed with status ${response.status}: ${response.statusText}`);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Resend OTP successful');
      return data;
    } catch (error) {
      console.error('❌ Resend OTP error:', error.message);
      throw error;
    }
  },

  loginUser: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('studentUser', JSON.stringify(data.user));
        }
      }
      return data;
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  },

  studentLogin: async (credentials) => {
    return apiService.loginUser(credentials);
  },

  getMyProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get profile error:', error.message);
      throw error;
    }
  },

  updateMyProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Update profile error:', error.message);
      throw error;
    }
  },

  getMyAttendance: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me/attendance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get attendance error:', error.message);
      throw error;
    }
  },

  getMyCourses: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get courses error:', error.message);
      throw error;
    }
  },

  getMyTeacher: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me/teacher`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get teacher error:', error.message);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get users error:', error.message);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get statistics error:', error.message);
      throw error;
    }
  },

  getCourses: async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get courses error:', error.message);
      throw error;
    }
  },

  submitContact: async (contactData) => {
    try {
      const response = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('❌ Submit contact error:', error.message);
      throw error;
    }
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

