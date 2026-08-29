import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Award, BookOpen, CheckCircle2, Clock, Sparkles, Users } from 'lucide-react';
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

  const featureIcons = [BookOpen, Users, Award, Clock];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="hero-content container">
          <div className="hero-text slide-in-left">
            <div className="eyebrow"><Sparkles size={15} /> {t('home.sectionSubtitle')}</div>
            <h1 className="hero-title">{t('home.welcome')}</h1>
            <p className="hero-subtitle">{t('home.subtitle')}</p>
            <p className="hero-description">{t('home.description')}</p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigateTo('register')}>
                {t('home.registerBtn')} <ArrowUpRight size={18} />
              </button>
              <button className="text-button" onClick={() => navigateTo('about')}>
                {t('home.learnMoreBtn')} <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="hero-proof">
              <div className="proof-mark"><CheckCircle2 size={18} /></div>
              <span>{t('home.qualityEducation')}<strong>{t('home.expertsTeach')}</strong></span>
            </div>
          </div>

          <div className="hero-image slide-in-right">
            <div className="image-frame">
              <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1100&q=85" alt="Open Quran on a reading stand" />
              <div className="image-caption">
                <BookOpen size={19} />
                <span>{t('home.qualityEducation')}</span>
                <span className="caption-dot" />
                <span>{t('home.expertsTeach')}</span>
              </div>
            </div>
            <div className="hero-stamp">NQ<br /><span>EST. 2014</span></div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-header fade-in">
            <div>
              <p className="section-subtitle">{t('home.sectionSubtitle')}</p>
              <h2 className="section-title">{t('home.sectionTitle')}</h2>
            </div>
            <p className="section-description">{t('home.sectionDescription')}</p>
          </div>
          <div className="features-grid">
            {features && features.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <div key={index} className="feature-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="feature-number">0{index + 1}</div>
                  <div className="feature-icon"><Icon size={25} /></div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <ArrowUpRight className="feature-arrow" size={19} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container stats-inner">
          <div className="stats-intro"><span>01</span><p>{t('home.sectionSubtitle')}</p></div>
          <div className="stats-grid">
            <div className="stat-card"><h2 className="stat-number">{!loadingStats && stats ? `${stats.students}+` : '...'}</h2><p className="stat-label">{statsLabels?.students}</p></div>
            <div className="stat-card"><h2 className="stat-number">{!loadingStats && stats ? `${stats.teachers}+` : '...'}</h2><p className="stat-label">{statsLabels?.teachers}</p></div>
            <div className="stat-card"><h2 className="stat-number">{!loadingStats && stats ? `${stats.experience}+` : '...'}</h2><p className="stat-label">{statsLabels?.experience}</p></div>
            <div className="stat-card"><h2 className="stat-number">{!loadingStats && stats ? `${stats.courses}+` : '...'}</h2><p className="stat-label">{statsLabels?.courses}</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <div><p className="section-subtitle">NIDA AL-QURAN</p><h2 className="cta-title">{t('home.welcome')}</h2></div>
          <div className="cta-action"><p className="cta-text">{t('home.description')}</p><button className="btn btn-primary btn-large" onClick={() => navigateTo('register')}>{t('home.registerBtn')} <ArrowUpRight size={19} /></button></div>
        </div>
      </section>
    </div>
  );
}

export default Home;