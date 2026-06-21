import React from 'react';
import { Check, Target, Eye, Heart, Award, Users } from 'lucide-react';
import '../styles/About.css';

function About() {
  const values = [
    {
      icon: <Heart size={40} />,
      title: 'ታማኝነት',
      description: 'በእስላማዊ እሴቶች ላይ ተመስርተን እንሰራለን'
    },
    {
      icon: <Award size={40} />,
      title: 'ጥራት',
      description: 'ከፍተኛ ደረጃ ያለው ትምህርት እንሰጣለን'
    },
    {
      icon: <Users size={40} />,
      title: 'ማህበረሰብ',
      description: 'ጠንካራ የእስላማዊ ማህበረሰብ እንገነባለን'
    },
    {
      icon: <Target size={40} />,
      title: 'ግብ',
      description: 'ግልጽ የትምህርት ግቦች እናስቀምጣለን'
    }
  ];

  const achievements = [
    'ከ500 በላይ የተመረቁ ተማሪዎች',
    'ከ25 በላይ የተመሰከሩ መምህራን',
    '10 ዓመታት የአገልግሎት ልምድ',
    'ከሀገር ውስጥና ውጭ እውቅና',
    'ዘመናዊ የማስተማሪያ መሳሪያዎች',
    'የመስመር ላይ የትምህርት መድረክ'
  ];

  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="about-header">
        <div className="container">
          <h1 className="page-title fade-in">ስለ ኒዳእ አል ቁርኣን</h1>
          <p className="page-subtitle fade-in">የእስላማዊ ትምህርት የላቀ ማዕከል</p>
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
              <h2>የእኛ ተልዕኮ</h2>
              <p>
                ኒዳእ አል ቁርኣን (የቁርኣን ጥሪ) ለሁሉም የዕድሜ ክልል ተማሪዎች ከፍተኛ ጥራት ያለው የእስላማዊ 
                ትምህርት መስጠት ላይ ያተኮረ ነው። የቁርኣን እና የእስላማዊ ትምህርቶችን መማር ተደራሽ፣ አሳታፊ 
                እና በመንፈስ የሚያበለጽግ አካባቢ ለመፍጠር እንጥራለን።
              </p>
            </div>

            <div className="vision-card slide-in-right">
              <div className="card-icon">
                <Eye size={48} />
              </div>
              <h2>የእኛ እይታ</h2>
              <p>
                የቁርኣን ትምህርት መሪ ማዕከል ለመሆን፣ የእስላማዊ ውብ ትምህርቶችን በጥበብ እና በርህራሄ 
                የሚያውቁ፣ የሚለማመዱ እና የሚያሰራጩ ትውልድ ማሳደግ። በማህበረሰቡ ውስጥ አዎንታዊ ለውጥ 
                የሚያመጡ የእስላማዊ መሪዎችን ማፍራት።
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>ስለ እኛ ተጨማሪ</h2>
              <p>
                ኒዳእ አል ቁርኣን ከ10 ዓመታት በላይ ጥራት ያለው የእስላማዊ ትምህርት እየሰጠ ያለ የመማሪያ 
                ማዕከል ነው። በአዲስ አበባ የሚገኝ ሲሆን፣ ለሺዎች ተማሪዎች የቁርኣን፣ የአረብኛ ቋንቋ እና 
                የእስላማዊ ጥናቶችን ማስተማር ችለናል።
              </p>
              <p>
                የእኛ መምህራን በጣም ልምድ ያላቸው እና በየመስኮቻቸው የተረጋገጡ ናቸው። ዘመናዊ የማስተማሪያ 
                ዘዴዎችን እና ባህላዊ የእስላማዊ ትምህርትን በማጣመር፣ ተማሪዎች በጥልቀት እንዲገነዘቡ እና 
                እንዲለማመዱ እናደርጋለን።
              </p>

              <h3>የምናቀርባቸው ነገሮች</h3>
              <ul className="features-list">
                {achievements.map((achievement, index) => (
                  <li key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <Check size={22} />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stats-card-about">
              <h3>የእኛ ስኬቶች</h3>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">የተመረቁ ተማሪዎች</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">ባለሙያ መምህራን</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">የተለያዩ ኮርሶች</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">ዓመታት ልምድ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">የእኛ እሴቶች</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="value-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="value-icon">{value.icon}</div>
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