import React, { useState } from 'react';
import { Menu, X, BookOpen, UserCheck, LogIn } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { apiService } from '../services/apiService';
import '../styles/Navigation.css';

function Navigation({ navigateTo }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (page) => {
    navigateTo(page);
    setIsMenuOpen(false);
  };

  const isLoggedIn = apiService.isAuthenticated();

  const isActive = (page) => {
    const pathMap = {
      'home': '/',
      'about': '/about',
      'services': '/services',
      'contact': '/contact',
      'register': '/register',
      'student-login': '/student/login',
      'student-dashboard': '/student/dashboard',
    };
    return location.pathname === pathMap[page];
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => handleNavClick('home')}>
          <BookOpen className="brand-icon" />
          <span className="brand-text">{t('nav.brand')}</span>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <a 
            onClick={() => handleNavClick('home')} 
            className={isActive('home') ? 'nav-link active' : 'nav-link'}
          >
            {t('nav.home')}
          </a>
          <a 
            onClick={() => handleNavClick('about')} 
            className={isActive('about') ? 'nav-link active' : 'nav-link'}
          >
            {t('nav.about')}
          </a>
          <a 
            onClick={() => handleNavClick('services')} 
            className={isActive('services') ? 'nav-link active' : 'nav-link'}
          >
            {t('nav.services')}
          </a>
          <a 
            onClick={() => handleNavClick('contact')} 
            className={isActive('contact') ? 'nav-link active' : 'nav-link'}
          >
            {t('nav.contact')}
          </a>

          {isLoggedIn ? (
            <button className="btn-nav-login logged-in" onClick={() => handleNavClick('student-dashboard')}>
              <UserCheck size={18} /> {t('nav.studentDashboard', 'My Dashboard')}
            </button>
          ) : (
            <button className="btn-nav-login" onClick={() => handleNavClick('student-login')}>
              <LogIn size={18} /> {t('nav.studentLogin', 'Student Login')}
            </button>
          )}

          <button className="btn-nav-register" onClick={() => handleNavClick('register')}>
            {t('nav.register')}
          </button>
          <LanguageSwitcher />
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;






