import React from 'react';
import { BookOpen, Mail, Phone, MapPin, Share2, Video, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/Footer.css';

function Footer({ navigateTo }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* About Section */}
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

            {/* Quick Links */}
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

            {/* Courses */}
            <div className="footer-section">
              <h4>ኮርሶቻችን</h4>
              <ul className="footer-links">
                <li><a href="#">የቁርኣን ትምህርት</a></li>
                <li><a href="#">የእስላማዊ ጥናቶች</a></li>
                <li><a href="#">የአረብኛ ቋንቋ</a></li>
                <li><a href="#">የህጻናት ፕሮግራም</a></li>
                <li><a href="#">የመስመር ላይ ትምህርት</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4>{t('footer.about')}</h4>
              <ul className="footer-contact">
                <li>
                  <MapPin size={18} />
                  <span>አዲስ አበባ፣ ኢትዮጵያ<br />መርካቶ አካባቢ</span>
                </li>
                <li>
                  <Phone size={18} />
                  <span>
                    +251 911 234 567<br />
                    +251 922 345 678
                  </span>
                </li>
                <li>
                  <Mail size={18} />
                  <span>
                    info@nidaulquran.com<br />
                    admin@nidaulquran.com
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} {t('nav.brand')}. {t('footer.copyright')}</p>
            <div className="footer-bottom-links">
              <a href="#">የግላዊነት ፖሊሲ</a>
              <span className="divider">|</span>
              <a href="#">የአገልግሎት ውሎች</a>
              <span className="divider">|</span>
              <a href="#">ጥያቄዎች</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;