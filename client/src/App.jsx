import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Register from './components/Register';
import './App.css';
import './styles/Global.css';
import './styles/InternalPages.css';

function App() {
  const navigate = useNavigate();

  const navigateTo = (page) => {
    const pageRoutes = {
      'home': '/',
      'about': '/about',
      'services': '/services',
      'contact': '/contact',
      'register': '/register',
    };
    navigate(pageRoutes[page] || '/');
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      <Navigation navigateTo={navigateTo} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home navigateTo={navigateTo} />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
}

export default App;