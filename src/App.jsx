import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (page) => {
    const pageRoutes = {
      'home': '/',
      'about': '/about',
      'services': '/services',
      'contact': '/contact',
      'register': '/register',
      'admin-login': '/admin/login',
      'admin-dashboard': '/admin/dashboard',
    };
    navigate(pageRoutes[page] || '/');
    window.scrollTo(0, 0);
  };

  const handleAdminClick = () => {
    navigate('/admin/login');
  };

  // Check if on admin page
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdminAuthenticated = apiService.isAuthenticated(true);

  // Redirect to dashboard if already logged in and trying to access login
  useEffect(() => {
    if (location.pathname === '/admin/login' && isAdminAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [location.pathname, isAdminAuthenticated, navigate]);

  return (
    <div className="App">
      {!isAdminPage && <Navigation navigateTo={navigateTo} onAdminClick={handleAdminClick} />}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home navigateTo={navigateTo} />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              isAdminAuthenticated ? (
                <AdminDashboard />
              ) : (
                <AdminLogin />
              )
            } 
          />
        </Routes>
      </main>
      
      {!isAdminPage && <Footer navigateTo={navigateTo} />}
    </div>
  );
}

export default App;