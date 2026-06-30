import React from 'react';
import { BookOpen, Users, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
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
  };

  const features = [
    {
      icon: <BookOpen size={48} />,
      title: 'የቁርኣን ትምህርት',
      description: 'በትክክለኛ ታጅዊድ ተምሩ'
    },
    {
      icon: <Users size={48} />,
      title: 'የተመራጡ መምህራን',
      description: 'ልምድ ያላቸው አስተማሪዎች'
    },
    {
      icon: <Award size={48} />,
      title: 'የምስክር ወረቀት',
      description: 'የተረጋገጠ ማረጋገጫ'
    },
    {
      icon: <Clock size={48} />,
      title: 'ተለዋዋጭ ሰዓት',
      description: 'የሚመቸዎት ጊዜ ይምረጡ'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text slide-in-left">
            <h1 className="hero-title">እንኳን ወደ ኒዳእ አል ቁርኣን በደህና መጡ</h1>
            <p className="hero-subtitle">የቁርኣን ትምህርትን በባለሙያ መምህራን ተማሩ</p>
            <p className="hero-description">
              የእስላማዊ ትምህርት ማዕከላችንን ይቀላቀሉ እና የቁርኣን ትምህርት፣ የአረብኛ ቋንቋ እና የእስላማዊ ጥናቶችን 
              መንፈሳዊ ጉዞ ይጀምሩ።
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigateTo('register')}>
                አሁኑኑ ይመዝገቡ
              </button>
              <button className="btn btn-secondary" onClick={() => navigateTo('about')}>
                ተጨማሪ ይወቁ
              </button>
            </div>
          </div>
          
          <div className="hero-image slide-in-right">
            <div className="floating-card">
              <BookOpen size={64} className="floating-icon" />
              <h3>ጥራት ያለው ትምህርት</h3>
              <p>ለእርስዎ ትምህርት የተሰጡ ባለሙያ አስተማሪዎች</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-header text-center fade-in" style={{ animationDelay: '0.1s' }}>
            <p className="section-subtitle">የእኛ ባለሞያ እና የማዕከላዊ አገልግሎቶች</p>
            <h2 className="section-title">ምን እንደምንሰጥ</h2>
            <p className="section-description">የተስፋ የሆነ የትምህርት ልምዶችን ጠቃሚ ስራዎች ጋር እንያዛለን።</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h2 className="stat-number">500+</h2>
              <p className="stat-label">ተማሪዎች</p>
            </div>
            <div className="stat-card">
              <h2 className="stat-number">25+</h2>
              <p className="stat-label">መምህራን</p>
            </div>
            <div className="stat-card">
              <h2 className="stat-number">10+</h2>
              <p className="stat-label">ዓመታት ልምድ</p>
            </div>
            <div className="stat-card">
              <h2 className="stat-number">15+</h2>
              <p className="stat-label">ኮርሶች</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">የእስላማዊ ትምህርት ጉዞዎን ዛሬ ይጀምሩ</h2>
            <p className="cta-text">
              በኒዳእ አል ቁርኣን ጋር ይቀላቀሉ እና የቁርኣን እውቀትዎን ያሳድጉ
            </p>
            <button className="btn btn-primary btn-large" onClick={() => navigateTo('register')}>
              አሁኑኑ ይመዝገቡ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;