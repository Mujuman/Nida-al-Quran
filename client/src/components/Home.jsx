import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        const data = await apiService.getStatistics();
        if (data && typeof data === 'object' && !data.msg) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

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

  const features = t('home.features', { returnObjects: true });
  const statsLabels = t('home.stats', { returnObjects: true });

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text slide-in-left">
            <h1 className="hero-title">{t('home.welcome')}</h1>
            <p className="hero-subtitle">{t('home.subtitle')}</p>
            <p className="hero-description">
              {t('home.description')}
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigateTo('register')}>
                {t('home.registerBtn')}
              </button>
              <button className="btn btn-secondary" onClick={() => navigateTo('about')}>
                {t('home.learnMoreBtn')}
              </button>
            </div>
          </div>
          
          <div className="hero-image slide-in-right">
            <div className="floating-card">
              <BookOpen size={64} className="floating-icon" />
              <h3>{t('home.qualityEducation')}</h3>
              <p>{t('home.expertsTeach')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-header text-center fade-in" style={{ animationDelay: '0.1s' }}>
            <p className="section-subtitle">{t('home.sectionSubtitle')}</p>
            <h2 className="section-title">{t('home.sectionTitle')}</h2>
            <p className="section-description">{t('home.sectionDescription')}</p>
          </div>

          <div className="features-grid">
            {features && features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">
                  {index === 0 && <BookOpen size={48} />}
                  {index === 1 && <Users size={48} />}
                  {index === 2 && <Award size={48} />}
                  {index === 3 && <Clock size={48} />}
                </div>
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
              <h2 className="stat-number">
                {!loadingStats && stats ? `${stats.students}+` : '...'}
              </h2>
              <p className="stat-label">{statsLabels?.students}</p>
            </div>
            <div className="stat-card">
              <h2 className="stat-number">
                {!loadingStats && stats ? `${stats.teachers}+` : '...'}
              </h2>
              <p className="stat-label">{statsLabels?.teachers}</p>
            </div>
            <div className="stat-card">
              <h2 className="stat-number">
                {!loadingStats && stats ? `${stats.experience}+` : '...'}
              </h2>
              <p className="stat-label">{statsLabels?.experience}</p>
            </div>
            <div className="stat-card">
              <h2 className="stat-number">
                {!loadingStats && stats ? `${stats.courses}+` : '...'}
              </h2>
              <p className="stat-label">{statsLabels?.courses}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">{t('home.welcome')}</h2>
            <p className="cta-text">
              {t('home.description')}
            </p>
            <button className="btn btn-primary btn-large" onClick={() => navigateTo('register')}>
              {t('home.registerBtn')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;