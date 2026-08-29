import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.adminLogin(formData);

      if (response.token) {
        apiService.saveToken(response.token, true);
        apiService.saveAdminInfo(response.admin);
        navigate('/dashboard');
      } else {
        setError(response.msg || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-bg-overlay" />
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">
            <div className="logo-icon">
              <Shield size={36} />
            </div>
            <h1>Nida Al-Quran</h1>
            <p>Admin Portal</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@nida.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>All admin roles use this portal</p>
            <div className="role-badges">
              <span className="role-badge main">Main Admin</span>
              <span className="role-badge sub">Teacher</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
