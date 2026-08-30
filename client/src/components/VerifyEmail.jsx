import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/apiService';
import '../styles/StudentDashboard.css';

function VerifyEmail({ navigateTo }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token provided in the URL link.');
      return;
    }

    const performVerification = async () => {
      try {
        setLoading(true);
        const res = await apiService.verifyEmail(token);
        if (res.success) {
          setSuccess(true);
          setMessage(res.msg || 'Email address verified successfully!');
          setUserInfo({ email: res.email, fullName: res.fullName });
        } else {
          setSuccess(false);
          setMessage(res.msg || 'Invalid or expired verification token.');
        }
      } catch (err) {
        console.error('Email verification error:', err);
        setSuccess(false);
        setMessage('Network error during email verification. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  const handleGoLogin = () => {
    if (navigateTo) navigateTo('student-login');
    else navigate('/student/login');
  };

  const handleGoRegister = () => {
    if (navigateTo) navigateTo('register');
    else navigate('/register');
  };

  return (
    <div className="student-portal-bg">
      <div className="student-login-container">
        <div className="student-login-card fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          
          {loading ? (
            <div>
              <Loader2 size={54} className="spin-icon" style={{ color: '#d4af37', margin: '0 auto 1.5rem', display: 'block', animation: 'spin 1s linear infinite' }} />
              <h2 style={{ color: '#1e3a8a', marginBottom: '0.5rem' }}>Verifying Email Address...</h2>
              <p style={{ color: '#64748b' }}>Please wait while we confirm your email verification token.</p>
            </div>
          ) : success ? (
            <div>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5',
                color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(16,185,129,0.2)'
              }}>
                <CheckCircle2 size={44} />
              </div>
              <h2 style={{ color: '#065f46', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                Email Verified Successfully! 🎉
              </h2>
              {userInfo?.fullName && (
                <p style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                  Welcome, {userInfo.fullName}!
                </p>
              )}
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.8rem', fontSize: '0.98rem' }}>
                {message}
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.8rem', textAlign: 'left', fontSize: '0.9rem', color: '#334155' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#1e3a8a' }}>What happens next?</p>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, lineHeight: 1.5 }}>
                  <li>Your verified application is in the queue for <strong>Main Admin approval</strong>.</li>
                  <li>Once approved, you will receive an approval email notification.</li>
                  <li>After approval, you can log in to your dashboard anytime using your password.</li>
                </ul>
              </div>

              <button onClick={handleGoLogin} className="btn btn-primary btn-block btn-login" style={{ width: '100%' }}>
                <LogIn size={18} /> Go to Student Login
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: '#fef2f2',
                color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(239,68,68,0.2)'
              }}>
                <AlertCircle size={44} />
              </div>
              <h2 style={{ color: '#991b1b', fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                Verification Failed
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.8rem', fontSize: '0.98rem' }}>
                {message}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <button onClick={handleGoRegister} className="btn btn-primary btn-block" style={{ padding: '0.85rem' }}>
                  Register Again
                </button>
                <button onClick={handleGoLogin} className="link-btn" style={{ justifyContent: 'center', padding: '0.5rem' }}>
                  <ArrowLeft size={16} /> Return to Student Login
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
