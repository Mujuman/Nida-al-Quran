import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Users, BookOpen, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import '../styles/Register.css';

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'default123',
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nextSteps = t('register.form.nextSteps', { returnObjects: true }) || [];
  const benefitCards = t('register.form.benefits', { returnObjects: true }) || [];
  const tipList = t('register.form.tipList', { returnObjects: true }) || [];
  const courseServices = t('services.services', { returnObjects: true }) || [];
  const courseIds = ['qaida', 'nazira', 'hifz', 'islamic-studies'];

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

      if (response.token) {
        apiService.saveToken(response.token);
        setIsSubmitted(true);

        setTimeout(() => {
          setIsSubmitted(false);
          setCurrentStep(1);
          setFormData({
            fullName: '',
            email: '',
            password: 'default123',
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
        }, 5000);
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

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
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
            <div className="success-registration">
              <div className="success-animation">
                <CheckCircle size={80} className="success-check" />
              </div>
              <h2>{t('register.form.successTitle')}</h2>
              <p>{t('register.form.successText')}</p>
              <div className="success-details">
                <div className="success-info">
                  <h3>{t('register.form.nextStepsTitle')}</h3>
                  <ul>
                    {nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="contact-support">
                  <h4>{t('register.form.questions')}</h4>
                  <p>📞 +251942431160</p>
                  <p>✉️ teyuteyba@gmail.com</p>
                </div>
              </div>
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
                        {courseServices.slice(0, 4).map((course, index) => (
                          <label key={courseIds[index]} className="course-option">
                            <input
                              type="radio"
                              name="course"
                              value={courseIds[index]}
                              checked={formData.course === courseIds[index]}
                              onChange={handleInputChange}
                              required
                            />
                            <div className="course-item">
                              <span className="course-arrow">➪</span>
                              <div className="course-content">
                                <span className="course-name">{course.title}</span>
                                <span className="course-label">{course.description}</span>
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