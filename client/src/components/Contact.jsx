import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import '../styles/Contact.css';

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'inquiry'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const typeOptions = [
    { value: 'inquiry', label: t('contact.form.types.inquiry') },
    { value: 'complaint', label: t('contact.form.types.complaint') },
    { value: 'suggestion', label: t('contact.form.types.suggestion') },
    { value: 'registration', label: t('contact.form.types.registration') },
  ];

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
      const response = await apiService.submitContact(formData);

      if (response.contactId || response.msg === 'Message sent successfully' || response.msg === 'Message sent successfully!') {
        setIsSubmitted(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          type: 'inquiry'
        });

        setTimeout(() => {
          setIsSubmitted(false);
        }, 4000);
      } else {
        setError(response.msg || t('contact.form.errorTryAgain'));
      }
    } catch (err) {
      console.error('Contact error:', err);
      setError(t('contact.form.errorGeneral'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-header">
        <div className="container">
          <h1 className="page-title fade-in">{t('contact.pageTitle')}</h1>
          <p className="page-subtitle fade-in">{t('contact.pageSubtitle')}</p>
          <div className="title-divider"></div>
        </div>
      </section>

      <section className="contact-content-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-side">
              <div className="contact-image-panel">
                <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1000&q=85" alt="Mosque interior" />
                <span>{t('contact.pageSubtitle')}</span>
              </div>
              <div className="contact-intro">
                <h2>{t('contact.intro')}</h2>
                <p>{t('contact.introDesc')}</p>
              </div>

              <div className="contact-details">
                <div className="contact-item slide-in-left">
                  <div className="contact-item-icon">
                    <MapPin size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>{t('contact.info.address')}</h4>
                    <p>{t('contact.info.addressValue')}</p>
                    <p>{t('contact.info.addressDetail')}</p>
                  </div>
                </div>

                <div className="contact-item slide-in-left" style={{ animationDelay: '0.1s' }}>
                  <div className="contact-item-icon">
                    <Phone size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>{t('contact.info.phone')}</h4>
                    <p>{t('contact.info.phoneValue1')}</p>
                    <p>{t('contact.info.phoneValue2')}</p>
                  </div>
                </div>

                <div className="contact-item slide-in-left" style={{ animationDelay: '0.2s' }}>
                  <div className="contact-item-icon">
                    <Mail size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>{t('contact.info.email')}</h4>
                    <p>{t('contact.info.emailValue1')}</p>
                    <p>{t('contact.info.emailValue2')}</p>
                  </div>
                </div>

                <div className="contact-item slide-in-left" style={{ animationDelay: '0.3s' }}>
                  <div className="contact-item-icon">
                    <Clock size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>{t('contact.info.hours')}</h4>
                    <p><strong>{t('contact.info.hoursWeekdays')}</strong></p>
                    <p><strong>{t('contact.info.hoursFriday')}</strong></p>
                  </div>
                </div>
              </div>

              <div className="social-connect">
                <h3>{t('contact.social.followUs')}</h3>
                <div className="social-links">
                  <a href="#" className="social-link">{t('contact.social.facebook')}</a>
                  <a href="#" className="social-link">{t('contact.social.telegram')}</a>
                  <a href="#" className="social-link">{t('contact.social.youtube')}</a>
                  <a href="#" className="social-link">{t('contact.social.instagram')}</a>
                </div>
              </div>
            </div>

            <div className="contact-form-side slide-in-right">
              {error && (
                <div style={{
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
                <div className="success-message-box">
                  <CheckCircle size={64} className="success-icon" />
                  <h2>{t('contact.form.successTitle')}</h2>
                  <p>{t('contact.form.successMsg')}</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h3>{t('contact.form.formTitle')}</h3>

                  <div className="form-group">
                    <label htmlFor="fullName">{t('contact.form.name')} *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.namePlaceholder')}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">{t('contact.form.email')} *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.emailPlaceholder')}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">{t('contact.form.phone')} *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.phonePlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">{t('contact.form.subject')} *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.subjectPlaceholder')}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="type">{t('contact.form.type')}</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        {typeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">{t('contact.form.message')} *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder={t('contact.form.messagePlaceholder')}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    <Send size={20} />
                    <span>{isLoading ? t('contact.form.sending') : t('contact.form.send')}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;