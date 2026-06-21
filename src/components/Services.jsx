import React from 'react';
import { BookOpen, GraduationCap, Languages, Users, Globe, Award } from 'lucide-react';
import '../styles/Services.css';

function Services() {
  const services = [
    {
      icon: <BookOpen size={48} />,
      title: 'የቁርኣን ትምህርት (ታጅዊድ)',
      description: 'በተረጋገጡ መምህራን ትክክለኛ የቁርኣን አንባቢ ሕጎችን ይማሩ። ታጅዊድን ከመሠረት እስከ ከፍተኛ ደረጃ ድረስ በሙያ ተማሩ።',
      features: [
        'የመሠረታዊ ታጅዊድ ሕጎች',
        'የላቀ ታጅዊድ ትምህርት',
        'የቁርኣን ማስታወሻ (ሂፍዝ)',
        'ተግባራዊ መለማመጃ ክፍለ ጊዜዎች'
      ],
      color: '#1E3A8A'
    },
    {
      icon: <GraduationCap size={48} />,
      title: 'የእስላማዊ ጥናቶች',
      description: 'ለመንፈሳዊ እድገት እና ግንዛቤ አስፈላጊ ርዕሶችን የሚሸፍን አጠቃላይ የእስላማዊ ትምህርት።',
      features: [
        'አቂዳህ (የእስላማዊ እምነት)',
        'ፊቅህ (የእስላማዊ ሕግ)',
        'ሲራህ (የነቢዩ ታሪክ)',
        'አኻላቅ (የእስላማዊ ሥነ ምግባር)'
      ],
      color: '#D4AF37'
    },
    {
      icon: <Languages size={48} />,
      title: 'የአረብኛ ቋንቋ',
      description: 'ቁርኣንን በዋና ቋንቋው ለመረዳት የአረብኛ ቋንቋን ይቆጣጠሩ።',
      features: [
        'የአረብኛ ሰዋሰው (ናሕው)',
        'የአረብኛ ሞርፎሎጂ (ሰርፍ)',
        'የውይይት አረብኛ',
        'የቁርኣን አረብኛ'
      ],
      color: '#3B82F6'
    },
    {
      icon: <Users size={48} />,
      title: 'የህጻናት ፕሮግራሞች',
      description: 'ልጆች እስላምን በአስደሳች እና አሳታፊ መንገድ እንዲማሩ የተዘጋጁ ልዩ ፕሮግራሞች።',
      features: [
        'ለህጻናት ቁርኣን',
        'የእስላማዊ ታሪኮች',
        'መሠረታዊ ሰላቶችና ዱዓዎች',
        'የእስላማዊ ባህሪዎች ትምህርት'
      ],
      color: '#10B981'
    },
    {
      icon: <Award size={48} />,
      title: 'የአዋቂዎች ክፍሎች',
      description: 'የእስላማዊ እውቀታቸውን ለማጠናከር ለሚፈልጉ አዋቂዎች የተዘጋጁ ተለዋዋጭ ፕሮግራሞች።',
      features: [
        'የቅዳሜና እሁድ ክፍሎች',
        'የማታ ክፍለ ጊዜዎች',
        'አንድ-ለ-አንድ መማሪያ',
        'የቡድን ውይይቶች'
      ],
      color: '#8B5CF6'
    },
    {
      icon: <Globe size={48} />,
      title: 'የመስመር ላይ ትምህርት',
      description: 'በመስመር ላይ የመማሪያ መድረካችን ኮርሶቻችንን ከየትኛውም ቦታ ይድረሱ።',
      features: [
        'የቀጥታ ምናባዊ ክፍሎች',
        'የተቀረጹ ትምህርቶች',
        'በይነተገናኝ ክፍለ ጊዜዎች',
        '24/7 የመማሪያ ቁሳቁስ መዳረሻ'
      ],
      color: '#F59E0B'
    }
  ];

  return (
    <div className="services-page">
      {/* Header Section */}
      <section className="services-header">
        <div className="container">
          <h1 className="page-title fade-in">የእኛ አገልግሎቶች</h1>
          <p className="page-subtitle fade-in">አጠቃላይ የእስላማዊ ትምህርት ፕሮግራሞች</p>
          <div className="title-divider"></div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="container">
          <div className="services-grid">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="service-card fade-in"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  '--accent-color': service.color
                }}
              >
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button className="btn-service">ተጨማሪ ይወቁ</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">ለምን እኛን መምረጥ አለብዎት?</h2>
          <div className="why-choose-grid">
            <div className="why-card">
              <div className="why-number">01</div>
              <h3>የተረጋገጡ መምህራን</h3>
              <p>ሁሉም መምህራኖቻችን በየመስኮቻቸው የተረጋገጡ እና ልምድ ያላቸው ናቸው።</p>
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