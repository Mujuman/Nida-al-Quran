import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import '../styles/Contact.css';

function Contact() {
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
      
      if (response.contactId || response.msg === 'Message sent successfully') {
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
        setError(response.msg || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header Section */}
      <section className="contact-header">
        <div className="container">
          <h1 className="page-title fade-in">ያግኙን</h1>
          <p className="page-subtitle fade-in">ከእርስዎ መስማት እንፈልጋለን</p>
          <div className="title-divider"></div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info-side">
              <div className="contact-intro">
                <h2>እንደሚገናኙን</h2>
                <p>
                  ጥያቄዎች አሉዎት? ያግኙን እና በተቻለ ፍጥነት መልስ እንሰጣለን። የእኛ ቡድን ሁል ጊዜ 
                  ለመርዳት ዝግጁ ነው።
                </p>
              </div>

              <div className="contact-details">
                <div className="contact-item slide-in-left">
                  <div className="contact-item-icon">
                    <MapPin size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>አድራሻ</h4>
                    <p>አዲስ አበባ፣ ኢትዮጵያ</p>
                    <p>መርካቶ አካባቢ</p>
                  </div>
                </div>

                <div className="contact-item slide-in-left" style={{ animationDelay: '0.1s' }}>
                  <div className="contact-item-icon">
                    <Phone size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>ስልክ</h4>
                    <p>+251 911 234 567</p>
                    <p>+251 922 345 678</p>
                  </div>
                </div>

                <div className="contact-item slide-in-left" style={{ animationDelay: '0.2s' }}>
                  <div className="contact-item-icon">
                    <Mail size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>ኢሜይል</h4>
                    <p>info@nidaulquran.com</p>
                    <p>admin@nidaulquran.com</p>
                  </div>
                </div>

                <div className="contact-item slide-in-left" style={{ animationDelay: '0.3s' }}>
                  <div className="contact-item-icon">
                    <Clock size={28} />
                  </div>
                  <div className="contact-item-content">
                    <h4>የቢሮ ሰዓታት</h4>
                    <p><strong>ቅዳሜ - ሐሙስ:</strong> 8:00 ጠዋት - 6:00 ምሽት</p>
                    <p><strong>አርብ:</strong> 2:00 ከሰዓት በኋላ - 6:00 ምሽት</p>
                  </div>
                </div>
              </div>

              <div className="social-connect">
                <h3>በማህበራዊ ሚዲያ ይከተሉን</h3>
                <div className="social-links">
                  <a href="#" className="social-link">Facebook</a>
                  <a href="#" className="social-link">Telegram</a>
                  <a href="#" className="social-link">YouTube</a>
                  <a href="#" className="social-link">Instagram</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-side slide-in-right">              {error && (
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
                  <h2>መልእክትዎ ተልኳል!</h2>
                  <p>በቅርቡ እናግኝዎታለን። ስላገናኙን እናመሰግናለን።</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h3>መልእክት ይላኩልን</h3>
                  
                  <div className="form-group">
                    <label htmlFor="fullName">ሙሉ ስም *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="ሙሉ ስምዎን ያስገቡ"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">ኢሜይል *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">ስልክ ቁጥር *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+251 911 234 567"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">ርዕስ *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="የመልእክትዎ ርዕስ"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="type">ታይፕ</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="inquiry">ጥያቄ</option>
                        <option value="complaint">ቅሬታ</option>
                        <option value="suggestion">ሐሳብ</option>
                        <option value="registration">ምዝገባ</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">መልእክት *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="መልእክትዎን እዚህ ይጻፉ..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    <Send size={20} />
                    <span>{isLoading ? 'በመላክ ላይ...' : 'መልእክት ላክ'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="map-section">
        <div className="map-placeholder">
          <MapPin size={64} />
          <h3>ያግኙን</h3>
          <p>አዲስ አበባ፣ መርካቶ አካባቢ</p>
        </div>
      </section>
    </div>
  );
}

export default Contact;