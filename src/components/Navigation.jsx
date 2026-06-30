import React, { useState } from 'react';
import { Menu, X, BookOpen, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation({ navigateTo, onAdminClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
          <span className="brand-text">ኒዳእ አል ቁርኣን</span>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <a 
            onClick={() => handleNavClick('home')} 
            className={isActive('home') ? 'nav-link active' : 'nav-link'}
          >
            መነሻ ገጽ
          </a>
          <a 
            onClick={() => handleNavClick('about')} 
            className={isActive('about') ? 'nav-link active' : 'nav-link'}
          >
            ስለ እኛ
          </a>
          <a 
            onClick={() => handleNavClick('services')} 
            className={isActive('services') ? 'nav-link active' : 'nav-link'}
          >
            አገልግሎቶች
          </a>
          <a 
            onClick={() => handleNavClick('contact')} 
            className={isActive('contact') ? 'nav-link active' : 'nav-link'}
          >
            ራኩሙ
          </a>
          <button className="btn-nav-register" onClick={() => handleNavClick('register')}>
            ይመዝገቡ
          </button>
          <button className="btn-nav-admin" onClick={onAdminClick}>
            <Shield size={18} />
            Admin
          </button>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;





