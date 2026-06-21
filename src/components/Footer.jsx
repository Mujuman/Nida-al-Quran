import React from 'react';
import { BookOpen, Mail, Phone, MapPin, Share2, Video, Send } from 'lucide-react';
import '../styles/Footer.css';

function Footer({ navigateTo }) {
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
                <h3>ኒዳእ አል ቁርኣን</h3>
              </div>
              <p className="footer-description">
                የቁርኣን ትምህርት እና የእስላማዊ እውቀት በኩል አእምሮዎችን ማብቃት። ለሁሉም የዕድሜ ክልል 
                ጥራት ያለው የእስላማዊ ትምህርት እናቀርባለን።
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
              <h4>ፈጣን አገናኞች</h4>
              <ul className="footer-links">
                <li><a onClick={() => navigateTo('home')}>መነሻ ገጽ</a></li>
                <li><a onClick={() => navigateTo('about')}>ስለ እኛ</a></li>
                <li><a onClick={() => navigateTo('services')}>አገልግሎቶች</a></li>
                <li><a onClick={() => navigateTo('contact')}>አድራሻ</a></li>
                <li><a onClick={() => navigateTo('register')}>ይመዝገቡ</a></li>
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
              <h4>አድራሻ</h4>
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
            <p>&copy; {currentYear} ኒዳእ አል ቁርኣን። ሁሉም መብቶች የተጠበቁ ናቸው።</p>
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