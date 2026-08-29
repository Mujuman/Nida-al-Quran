import React, { useEffect, useState } from 'react';
import { BookOpen, Eye, BookMarked, Scroll } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import '../styles/Services.css';

function Services() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const whyChoose = t('services.whyChoose', { returnObjects: true });

  useEffect(() => {
    apiService.getCourses()
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch((error) => console.error('Error fetching courses:', error))
      .finally(() => setLoadingServices(false));
  }, []);

  const localizedCourse = (course) => ({
    title: course.title?.[i18n.language] || course.title?.en || '',
    description: course.description?.[i18n.language] || course.description?.en || '',
    features: course.features?.[i18n.language] || course.features?.en || [],
  });

  const icons = [
    <BookOpen size={48} />,
    <Eye size={48} />,
    <BookMarked size={48} />,
    <Scroll size={48} />
  ];

  const colors = ['#1E3A8A', '#D4AF37', '#3B82F6', '#10B981'];

  return (
    <div className="services-page">
      {/* Header Section */}
      <section className="services-header">
        <div className="container">
          <h1 className="page-title fade-in">{t('services.pageTitle')}</h1>
          <p className="page-subtitle fade-in">{t('services.pageSubtitle')}</p>
          <div className="title-divider"></div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="container">
          <div className="services-intro-visual">
            <img src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1400&q=85" alt="Student reading the Quran" />
            <div><span>02 / {t('services.courseHeading')}</span><h2>{t('services.pageSubtitle')}</h2></div>
          </div>
          <div className="services-grid">
            {loadingServices ? <p className="course-loading">Loading courses...</p> : services.map((course, index) => {
              const service = localizedCourse(course);
              return (
              <div 
                key={course.id || course.slug}
                className="service-card fade-in"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  '--accent-color': colors[index]
                }}
              >
                <div className="service-icon">{icons[index]}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features && service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button className="btn-service" onClick={() => navigate('/register')}>{t('home.learnMoreBtn')} &rarr;</button>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">{t('services.whyChooseTitle')}</h2>
          <div className="why-choose-grid">
            {whyChoose && whyChoose.map((item, index) => (
              <div className="why-card" key={index}>
                <div className="why-number">0{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <h2>{t('services.ctaTitle')}</h2>
          <p>{t('services.ctaText')}</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>{t('home.registerBtn')} &rarr;</button>
        </div>
      </section>
    </div>
  );
}

export default Services;