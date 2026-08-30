import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle, ArrowRight, ShieldCheck, CheckCircle, RefreshCw, X } from 'lucide-react';
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

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
        if (res.requiresOtp || (res.msg && res.msg.toLowerCase().includes('otp'))) {
          setShowOtpModal(true);
        }
        setError(res.msg || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpModal = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 6) {
      setOtpError('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const response = await apiService.verifyOtp(email, otpInput);
      if (response.success) {
        setOtpSuccess('Email verified successfully! Log in again to continue.');
        setTimeout(() => {
          setShowOtpModal(false);
          setError('Email verified! You can now log in once approved by the administrator.');
        }, 1200);
      } else {
        setOtpError(response.msg || 'Invalid verification code.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setOtpError('Error verifying code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
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
              <div style={{ flex: 1 }}>
                <span>{error}</span>
                {(error.includes('OTP') || error.includes('verify your email')) && (
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(true)}
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '6px 14px',
                      fontSize: '0.85rem',
                      background: '#17473c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    🔑 Enter 6-Digit OTP Code Now
                  </button>
                )}
              </div>
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

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            textAlign: 'center',
          }}>
            <button
              onClick={() => setShowOtpModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: '#f1f5f9',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8faf9', border: '2px solid #17473c', color: '#17473c', display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
              <ShieldCheck size={36} />
            </div>

            <h3 style={{ fontFamily: 'Georgia, serif', color: '#14231f', marginBottom: '0.5rem' }}>Enter Verification Code 🔑</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem' }}>
              Enter the 6-digit OTP code sent to <strong>{email}</strong> to verify your account.
            </p>

            {otpError && (
              <div className="student-alert error mb-3" style={{ fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="student-alert success mb-3" style={{ fontSize: '0.85rem' }}>
                <CheckCircle size={16} />
                <span>{otpSuccess}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpModal}>
              <input
                type="text"
                maxLength="6"
                placeholder="••••••"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                  setOtpError('');
                }}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '1.8rem',
                  letterSpacing: '10px',
                  fontWeight: 'bold',
                  padding: '0.75rem',
                  border: '2px dashed #17473c',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  background: '#f8faf9',
                  color: '#17473c',
                }}
                autoFocus
                required
              />

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isVerifyingOtp || otpInput.length < 6}
                style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 'bold' }}
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw size={18} className="spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Verify OTP & Continue
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentLogin;
