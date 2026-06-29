import React, { useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import '../styles/Navigation.css';

function Navigation({ currentPage, navigateTo }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (page) => {
    navigateTo(page);
    setIsMenuOpen(false);
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
            className={currentPage === 'home' ? 'nav-link active' : 'nav-link'}
          >
            መነሻ ገጽ
          </a>
          <a 
            onClick={() => handleNavClick('about')} 
            className={currentPage === 'about' ? 'nav-link active' : 'nav-link'}
          >
            ስለ እኛ
          </a>
          <a 
            onClick={() => handleNavClick('services')} 
            className={currentPage === 'services' ? 'nav-link active' : 'nav-link'}
          >
            አገልግሎቶች
          </a>
          <a 
            onClick={() => handleNavClick('contact')} 
            className={currentPage === 'contact' ? 'nav-link active' : 'nav-link'}
          >
            አድራሻ
          </a>
          <button className="btn-nav-register" onClick={() => handleNavClick('register')}>
            ይመዝገቡ
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