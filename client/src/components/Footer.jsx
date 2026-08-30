import React, { useEffect, useState } from 'react';
import { BookOpen, Mail, Phone, MapPin, Share2, Video, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import '../styles/Footer.css';

function Footer({ navigateTo }) {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    apiService.getCourses()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch((error) => console.error('Error fetching footer courses:', error));
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-brand">
                <BookOpen className="footer-brand-icon" />
                <h3>{t('nav.brand')}</h3>
              </div>
              <p className="footer-description">
                {t('footer.description')}
              </p>
              <div className="footer-social">
                <a href="#" className="social-icon" aria-label="Share">
                  <Share2 size={20} />
                </a>
                <a href="#" className="social-icon" aria-label="Video">
                  <Video size={20} />
                </a>
                <a href="#" className="social-icon" aria-label="Message">
                  <Send size={20} />
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4>{t('footer.quickLinks')}</h4>
              <ul className="footer-links">
                <li><a onClick={() => navigateTo('home')}>{t('nav.home')}</a></li>
                <li><a onClick={() => navigateTo('about')}>{t('nav.about')}</a></li>
                <li><a onClick={() => navigateTo('services')}>{t('nav.services')}</a></li>
                <li><a onClick={() => navigateTo('contact')}>{t('nav.contact')}</a></li>
                <li><a onClick={() => navigateTo('register')}>{t('nav.register')}</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>{t('footer.coursesTitle')}</h4>
              <ul className="footer-links">
                {courses.map((course, index) => (
                  <li key={course.id || course.slug || index}>
                    <a href="#">
                      {typeof course.title === 'string'
                        ? course.title
                        : (course.title?.[i18n.language] || course.title?.en || course.title?.am || course.slug || 'Course')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4>{t('footer.about')}</h4>
              <ul className="footer-contact">
                <li>
                  <MapPin size={18} />
                  <span>{t('contact.info.addressValue')}<br />{t('contact.info.addressDetail')}</span>
                </li>
                <li>
                  <Phone size={18} />
                  <span>
                    {t('contact.info.phoneValue1')}<br />
                    {t('contact.info.phoneValue2')}
                  </span>
                </li>
                <li>
                  <Mail size={18} />
                  <span>
                    {t('contact.info.emailValue1')}<br />
                    {t('contact.info.emailValue2')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} {t('nav.brand')}. {t('footer.copyright')}</p>
            <div className="footer-bottom-links">
              <a href="#">{t('footer.privacyPolicy')}</a>
              <span className="divider">|</span>
              <a href="#">{t('footer.terms')}</a>
              <span className="divider">|</span>
              <a href="#">{t('footer.questions')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;