import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/apiService';
import '../styles/StudentDashboard.css';

function StudentLogin({ navigateTo }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.studentLogin({ email, password });
      
      if (res.token) {
        if (navigateTo) {
          navigateTo('student-dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.msg || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoRegister = () => {
    if (navigateTo) {
      navigateTo('register');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="student-portal-bg">
      <div className="student-login-container">
        <div className="student-login-card fade-in">
          <div className="student-card-header">
            <div className="student-badge">
              <BookOpen size={24} />
            </div>
            <h2>{t('student.loginTitle', 'Student Login')}</h2>
            <p>{t('student.loginSubtitle', 'Access your Nida Al-Quran Student Portal & Dashboard')}</p>
          </div>

          {error && (
            <div className="student-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="student-login-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} /> {t('student.emailLabel', 'Email Address')}
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={16} /> {t('student.passwordLabel', 'Password')}
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-login" disabled={loading}>
              {loading ? (
                <span className="spinner-text">Logging in...</span>
              ) : (
                <>
                  <LogIn size={18} /> {t('student.loginBtn', 'Log In to Dashboard')}
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {t('student.noAccount', "Don't have a student account yet?")}{' '}
              <button type="button" className="link-btn" onClick={handleGoRegister}>
                {t('student.registerNow', 'Register Here')} <ArrowRight size={14} />
              </button>
            </p>
          </div>

          <div className="security-notice">
            <ShieldCheck size={15} />
            <span>Secure SSL encrypted student portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
