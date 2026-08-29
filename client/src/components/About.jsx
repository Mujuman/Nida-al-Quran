import React from 'react';
import { Check, Target, Eye, Heart, Award, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/About.css';

function About() {
  const { t } = useTranslation();

  const values = t('about.values', { returnObjects: true });
  const achievements = t('about.achievements', { returnObjects: true });

  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="about-header">
        <div className="container">
          <h1 className="page-title fade-in">{t('about.pageTitle')}</h1>
          <p className="page-subtitle fade-in">{t('about.pageSubtitle')}</p>
          <div className="title-divider"></div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card slide-in-left">
              <div className="card-icon">
                <Target size={48} />
              </div>
              <h2>{t('about.mission')}</h2>
              <p>
                {t('about.missionText')}
              </p>
            </div>

            <div className="vision-card slide-in-right">
              <div className="card-icon">
                <Eye size={48} />
              </div>
              <h2>{t('about.vision')}</h2>
              <p>
                {t('about.visionText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content-section">
        <div className="container">
          <div className="about-story-visual">
            <img src="https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=1200&q=85" alt="Quran and prayer beads" />
            <div className="story-overlay"><span>01</span><strong>{t('about.pageSubtitle')}</strong></div>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <h2>{t('about.aboutMore')}</h2>
              <p>
                {t('about.description1')}
              </p>
              <p>
                {t('about.description2')}
              </p>

              <h3>{t('about.whatWeOffer')}</h3>
              <ul className="features-list">
                {achievements && achievements.map((achievement, index) => (
                  <li key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <Check size={22} />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stats-card-about">
              <h3>{t('about.ourAchievements')}</h3>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">{t('about.stat1')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">{t('about.stat2')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">{t('about.stat3')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">{t('about.stat4')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">{t('about.ourValues')}</h2>
          <div className="values-grid">
            {values && values.map((value, index) => (
              <div 
                key={index} 
                className="value-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="value-icon">
                  {index === 0 && <Heart size={40} />}
                  {index === 1 && <Award size={40} />}
                  {index === 2 && <Users size={40} />}
                  {index === 3 && <Target size={40} />}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;