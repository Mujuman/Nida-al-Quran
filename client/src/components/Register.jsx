import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Users, BookOpen, Award, CheckCircle, AlertCircle, Lock, Eye, EyeOff, ShieldCheck, RefreshCw, Key, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import '../styles/Register.css';

function Register() {
  const { t, i18n } = useTranslation();
  const [courseServices, setCourseServices] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
    course: '',
    level: '',
    schedule: '',
    guardian: '',
    guardianPhone: '',
    learningMedia: '',
    message: ''
  });
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Verification States
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  const nextSteps = t('register.form.nextSteps', { returnObjects: true }) || [];
  const benefitCards = t('register.form.benefits', { returnObjects: true }) || [];
  const tipList = t('register.form.tipList', { returnObjects: true }) || [];

  useEffect(() => {
    apiService.getCourses()
      .then((data) => setCourseServices(Array.isArray(data) ? data : []))
      .catch((error) => console.error('Error fetching registration courses:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.password || formData.password.length < 6) {
      setError('Password is required and must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        course: formData.course,
        level: formData.level,
        schedule: formData.schedule,
        guardian: formData.guardian,
        guardianPhone: formData.guardianPhone,
        learningMedia: formData.learningMedia,
        message: formData.message,
      };

      const response = await apiService.registerUser(registrationData);

      if (response.success || response.requiresOtp || response.user) {
        setRegisteredEmail(formData.email);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.msg || t('register.form.errorTryAgain'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('register.form.errorGeneral'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const response = await apiService.verifyOtp(registeredEmail, otpInput);
      if (response.success) {
        setIsVerifiedSuccess(true);
        setOtpSuccess(response.msg || 'Email verified successfully!');
      } else {
        setOtpError(response.msg || 'Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setOtpError('Error verifying code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const response = await apiService.resendOtp(registeredEmail);
      if (response.success) {
        setOtpSuccess(response.msg || 'A new 6-digit OTP code has been sent to your email address.');
      } else {
        setOtpError(response.msg || 'Unable to resend verification code.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setOtpError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.age || !formData.gender) {
        setError('Please fill in all required personal information fields.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError('Please create a password (minimum 6 characters).');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please check again.');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="register-page">
      <section className="register-header">
        <div className="container">
          <h1 className="page-title fade-in">{t('register.pageTitle')}</h1>
          <p className="page-subtitle fade-in">{t('register.pageSubtitle')}</p>
          <div className="title-divider"></div>
        </div>
      </section>

      <section className="register-content-section">
        <div className="container">
          {error && (
            <div className="error-alert" style={{
              backgroundColor: '#fee',
              border: '1px solid #f88',
              color: '#c33',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="otp-verification-container">
              {!isVerifiedSuccess ? (
                <div className="otp-card shadow-card">
                  <div className="otp-header">
                    <div className="otp-icon-badge">
                      <ShieldCheck size={48} />
                    </div>
                    <h2>Enter 6-Digit Verification Code 🔑</h2>
                    <p className="otp-subtitle">
                      We sent a 6-digit verification code to <strong className="email-highlight">{registeredEmail}</strong>. Please check your inbox and enter the code below.
                    </p>
                  </div>

                  {otpError && (
                    <div className="otp-alert error mb-4">
                      <AlertCircle size={18} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {otpSuccess && (
                    <div className="otp-alert success mb-4">
                      <CheckCircle size={18} />
                      <span>{otpSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="otp-form">
                    <div className="form-group">
                      <label htmlFor="otpInput">6-Digit Verification Code (OTP)</label>
                      <input
                        id="otpInput"
                        type="text"
                        maxLength="6"
                        placeholder="••••••"
                        value={otpInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setOtpInput(val);
                          setOtpError('');
                        }}
                        className="otp-code-input"
                        autoFocus
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block btn-otp-submit"
                      disabled={isVerifyingOtp || otpInput.length < 6}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw size={18} className="spin" /> Verifying Code...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} /> Verify Code & Complete Registration
                        </>
                      )}
                    </button>
                  </form>

                  <div className="otp-footer">
                    <p>Didn't receive the verification code in your email?</p>
                    <button
                      type="button"
                      className="btn-link-resend"
                      onClick={handleResendOtp}
                      disabled={isResendingOtp}
                    >
                      {isResendingOtp ? 'Resending Code...' : '📧 Resend Verification Code'}
                    </button>
                  </div>

                  <div className="contact-support mt-4 shadow-card">
                    <h4>Need Assistance? 💬</h4>
                    <p style={{ color: '#ffffff', fontSize: '0.92rem', marginBottom: '1.25rem', opacity: 0.9 }}>
                      Have questions or need help verifying your account? Reach out to us:
                    </p>
                    <div className="support-buttons-grid">
                      <a href="tel:+251942431160" className="support-action-btn phone-link">
                        <Phone size={18} /> +251942431160
                      </a>
                      <a href="mailto:teyuteyba@gmail.com" className="support-action-btn email-link">
                        <Mail size={18} /> teyuteyba@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="success-registration shadow-card">
                  <div className="success-icon-badge">
                    <CheckCircle size={56} className="text-green" />
                  </div>
                  <h2>Email Verified Successfully! 🎉</h2>
                  <p className="success-subheadline">
                    Your email address <strong className="email-highlight">{registeredEmail}</strong> has been verified.
                  </p>

                  <div className="next-steps-card text-left mt-4 mb-4">
                    <div className="card-header-mini">
                      <CheckCircle size={20} className="icon-gold" />
                      <h3>Next Steps:</h3>
                    </div>
                    <ol className="steps-list">
                      <li>
                        <span className="step-num">1</span>
                        <span>Your registration application is submitted to the Main Admin for approval.</span>
                      </li>
                      <li>
                        <span className="step-num">2</span>
                        <span>Once approved by admin, you will receive an email confirmation.</span>
                      </li>
                      <li>
                        <span className="step-num">3</span>
                        <span>You can then log in with your email and password!</span>
                      </li>
                    </ol>
                  </div>

                  <div className="actions mt-4">
                    <button className="btn btn-primary" onClick={() => navigate('/student/login')}>
                      Go to Student Login <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="registration-layout">
            <aside className="register-aside">
              <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=85" alt="Open Quran" />
              <span>03 / BEGIN YOUR JOURNEY</span>
              <h2>{t('register.pageSubtitle')}</h2>
              <p>{t('home.description')}</p>
            </aside>
            <div className="registration-container">
              <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">{t('register.form.personalInfo')}</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">{t('register.form.courseSelection')}</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">{t('register.form.additionalInfo')}</div>
                </div>
              </div>

              <form className="registration-form" onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="form-step fade-in">
                    <div className="step-header">
                      <User size={32} />
                      <h2>{t('register.form.personalInfo')}</h2>
                      <p>{t('register.form.personalInfoDesc')}</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="fullName">
                        <User size={18} />
                        {t('register.form.fullName')} *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder={t('register.form.fullNamePlaceholder')}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">
                          <Mail size={18} />
                          {t('register.form.email')} *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t('register.form.emailPlaceholder')}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">
                          <Phone size={18} />
                          {t('register.form.phone')} *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t('register.form.phonePlaceholder')}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="password">
                          <Lock size={18} />
                          {t('register.form.password', 'Create Password')} *
                        </label>
                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Min 6 characters"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            className="btn-toggle-pw"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                            style={{
                              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                              background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
                            }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword">
                          <Lock size={18} />
                          {t('register.form.confirmPassword', 'Confirm Password')} *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Re-enter password"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="age">
                          <Calendar size={18} />
                          {t('register.form.age')} *
                        </label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder={t('register.form.agePlaceholder')}
                          min="5"
                          max="100"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="gender">
                          <Users size={18} />
                          {t('register.form.gender')} *
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">{t('register.form.genderSelect')}</option>
                          <option value="male">{t('register.form.genderMale')}</option>
                          <option value="female">{t('register.form.genderFemale')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-navigation">
                      <button type="button" className="btn btn-next" onClick={nextStep} disabled={isLoading}>
                        {t('register.form.next')} →
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="form-step fade-in">
                    <div className="step-header">
                      <BookOpen size={32} />
                      <h2>{t('register.form.courseSelection')}</h2>
                      <p>{t('register.form.courseSelectionDesc')}</p>
                    </div>

                    <div className="courses-section">
                      <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>{t('services.courseHeading')}</h3>
                      <div className="courses-list">
                        {courseServices.map((course, index) => (
                          <label key={course.id || course.slug} className="course-option">
                            <input
                              type="radio"
                              name="course"
                              value={course.slug}
                              checked={formData.course === course.slug}
                              onChange={handleInputChange}
                              required
                            />
                            <div className="course-item">
                              <span className="course-arrow">➪</span>
                              <div className="course-content">
                                <span className="course-name">{typeof course.title === 'string' ? course.title : (course.title?.[i18n.language] || course.title?.en || course.title?.am || course.slug)}</span>
                                <span className="course-label">{typeof course.description === 'string' ? course.description : (course.description?.[i18n.language] || course.description?.en || course.description?.am || '')}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="level">
                          <Award size={18} />
                          {t('register.form.level')} *
                        </label>
                        <select
                          id="level"
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">{t('register.form.levelSelect')}</option>
                          <option value="beginner">{t('register.levels.0')}</option>
                          <option value="intermediate">{t('register.levels.1')}</option>
                          <option value="advanced">{t('register.levels.2')}</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="schedule">
                          <Calendar size={18} />
                          {t('register.form.schedule')} *
                        </label>
                        <select
                          id="schedule"
                          name="schedule"
                          value={formData.schedule}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">{t('register.form.scheduleSelect')}</option>
                          <option value="morning">{t('register.schedules.0')}</option>
                          <option value="afternoon">{t('register.schedules.1')}</option>
                          <option value="evening">{t('register.schedules.2')}</option>
                          <option value="weekend">{t('register.schedules.3')}</option>
                          <option value="flexible">{t('register.schedules.4')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="info-box">
                      <h4>💡 {t('register.form.tipTitle')}</h4>
                      <ul>
                        {tipList.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="form-navigation">
                      <button type="button" className="btn btn-prev" onClick={prevStep} disabled={isLoading}>
                        ← {t('register.form.previous')}
                      </button>
                      <button type="button" className="btn btn-next" onClick={nextStep} disabled={isLoading}>
                        {t('register.form.next')} →
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="form-step fade-in">
                    <div className="step-header">
                      <Award size={32} />
                      <h2>{t('register.form.additionalInfo')}</h2>
                      <p>{t('register.form.additionalInfoDesc')}</p>
                    </div>

                    <div className="guardian-section">
                      <h3>{t('register.form.guardianTitle')}</h3>
                      <p className="section-note">{t('register.form.guardianNote')}</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="guardian">
                        <User size={18} />
                        {t('register.form.guardian')} *
                      </label>
                      <input
                        type="text"
                        id="guardian"
                        name="guardian"
                        value={formData.guardian}
                        onChange={handleInputChange}
                        placeholder={t('register.form.guardianPlaceholder')}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="guardianPhone">
                        <Phone size={18} />
                        {t('register.form.guardianPhone')} *
                      </label>
                      <input
                        type="tel"
                        id="guardianPhone"
                        name="guardianPhone"
                        value={formData.guardianPhone}
                        onChange={handleInputChange}
                        placeholder={t('register.form.guardianPhonePlaceholder')}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="learningMedia">
                        <BookOpen size={18} />
                        Live learning platform *
                      </label>
                      <select
                        id="learningMedia"
                        name="learningMedia"
                        value={formData.learningMedia}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a platform</option>
                        <option value="telegram">Telegram</option>
                        <option value="google-meet">Google Meet</option>
                        <option value="skype">Skype</option>
                        <option value="zoom">Zoom</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">
                        {t('register.form.message')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder={t('register.form.messagePlaceholder')}
                      ></textarea>
                    </div>

                    <div className="terms-section">
                      <label className="checkbox-label">
                        <input type="checkbox" required />
                        <span>
                          <a href="#" className="terms-link">{t('register.form.termsLink')}</a> {t('register.form.termsAnd')} {' '}
                          <a href="#" className="terms-link">{t('register.form.privacyLink')}</a> {t('register.form.agreeText')}
                        </span>
                      </label>
                    </div>

                    <div className="registration-summary">
                      <h3>{t('register.form.summaryTitle')}</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <strong>{t('register.form.summaryName')}:</strong>
                          <span>{formData.fullName || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>{t('register.form.summaryEmail')}:</strong>
                          <span>{formData.email || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>{t('register.form.summaryPhone')}:</strong>
                          <span>{formData.phone || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>{t('register.form.summaryCourse')}:</strong>
                          <span>{formData.course || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>{t('register.form.summaryLevel')}:</strong>
                          <span>{formData.level || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>{t('register.form.summarySchedule')}:</strong>
                          <span>{formData.schedule || '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-navigation">
                      <button type="button" className="btn btn-prev" onClick={prevStep} disabled={isLoading}>
                        ← {t('register.form.previous')}
                      </button>
                      <button type="submit" className="btn btn-submit-final" disabled={isLoading}>
                        {isLoading ? t('register.form.submitLoading') : t('register.form.submit')}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
            </div>
          )}
        </div>
      </section>

      {!isSubmitted && (
        <section className="why-register-section">
          <div className="container">
            <h2>{t('register.form.whyRegisterTitle')}</h2>
            <div className="benefits-grid">
              {benefitCards.map((benefit, index) => (
                <div className="benefit-card" key={index}>
                  <div className="benefit-icon">{['🎓', '📚', '🏆', '💰'][index]}</div>
                  <h3>{benefit}</h3>
                  <p>{t(`register.form.benefitDesc.${index}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Register;