import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Register from './components/Register';
import './App.css';
import './styles/Global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      <Navigation currentPage={currentPage} navigateTo={navigateTo} />
      
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