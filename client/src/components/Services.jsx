import React from 'react';
import { BookOpen, Eye, BookMarked, Scroll } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/Services.css';

function Services() {
  const { t } = useTranslation();
  
  const services = t('services.services', { returnObjects: true });

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
          <div className="services-grid">
            {services && services.map((service, index) => (
              <div 
                key={index} 
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
                <button className="btn-service">{t('home.learnMoreBtn')}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">{t('services.pageTitle')}</h2>
          <div className="why-choose-grid">
            <div className="why-card">
              <div className="why-number">01</div>
              <h3>{t('services.pageTitle')}</h3>
              <p>{t('about.description2')}</p>
            </div>
            <div className="why-card">
              <div className="why-number">02</div>
              <h3>ዘመናዊ ዘዴዎች</h3>
              <p>ባህላዊ እውቀትን ከዘመናዊ የማስተማሪያ ቴክኒኮች ጋር እናዋህዳለን።</p>
            </div>
            <div className="why-card">
              <div className="why-number">03</div>
              <h3>ተለዋዋጭ መርሐ ግብር</h3>
              <p>የሚመቸዎትን ጊዜ መምረጥ ይችላሉ - ጠዋት፣ ከሰዓት በኋላ ወይም ምሽት።</p>
            </div>
            <div className="why-card">
              <div className="why-number">04</div>
              <h3>ተመጣጣኝ ዋጋ</h3>
              <p>ለሁሉም የሚደርስ የዋጋ አሰጣጥ በጥራት ላይ ሳንነካ እናቀርባለን።</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <h2>ዛሬ ጉዞዎን ይጀምሩ</h2>
          <p>የሚመቸዎትን ኮርስ ይምረጡ እና ከእኛ ጋር ይመዝገቡ</p>
          <button className="btn btn-primary btn-large">አሁኑኑ ይመዝገቡ</button>
        </div>
      </section>
    </div>
  );
}

export default Services;