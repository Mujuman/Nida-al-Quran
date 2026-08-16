import React, { useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
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

  const isActive = (page) => {
    const pathMap = {
      'home': '/',
      'about': '/about',
      'services': '/services',
      'contact': '/contact',
      'register': '/register',
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





