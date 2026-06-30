import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { apiService } from './services/apiService';
import './App.css';
import './styles/Global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check admin authentication
    setIsAdminAuthenticated(apiService.isAuthenticated(true));
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsAdminPage(false);
    window.scrollTo(0, 0);
  };

  const handleAdminPage = (page) => {
    setIsAdminPage(true);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Admin routes
  if (isAdminPage) {
    if (currentPage === 'admin-login') {
      return <AdminLogin />;
    }
    if (currentPage === 'admin-dashboard') {
      if (!isAdminAuthenticated) {
        return <AdminLogin />;
      }
      return <AdminDashboard />;
    }
  }

  return (
    <div className="App">
      <Navigation currentPage={currentPage} navigateTo={navigateTo} onAdminClick={() => handleAdminPage('admin-login')} />
      
      <main className="main-content">
        {currentPage === 'home' && <Home navigateTo={navigateTo} />}
        {currentPage === 'about' && <About />}
        {currentPage === 'services' && <Services />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'register' && <Register />}
      </main>
      
      <Footer navigateTo={navigateTo} />
    </div>
  );
}

export default App;