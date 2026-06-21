import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Users, BookOpen, Award, CheckCircle } from 'lucide-react';
import '../styles/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    course: '',
    level: '',
    schedule: '',
    guardian: '',
    guardianPhone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration Data:', formData);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setCurrentStep(1);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        course: '',
        level: '',
        schedule: '',
        guardian: '',
        guardianPhone: '',
        message: ''
      });
    }, 5000);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="register-page">
      {/* Header Section */}
      <section className="register-header">
        <div className="container">
          <h1 className="page-title fade-in">ምዝገባ</h1>
          <p className="page-subtitle fade-in">ከኒዳእ አል ቁርኣን ጋር ጉዞዎን ይጀምሩ</p>
          <div className="title-divider"></div>
        </div>
      </section>

      {/* Registration Content */}
      <section className="register-content-section">
        <div className="container">
          {isSubmitted ? (
            <div className="success-registration">
              <div className="success-animation">
                <CheckCircle size={80} className="success-check" />
              </div>
              <h2>ምዝገባ ተሳክቷል!</h2>
              <p>ስላመዘገቡ እናመሰግናለን። የምዝገባዎ መረጃ ተቀብለናል።</p>
              <div className="success-details">
                <div className="success-info">
                  <h3>ቀጣይ ደረጃዎች:</h3>
                  <ul>
                    <li>የማረጋገጫ ኢሜይል በቅርቡ ይደርስዎታል</li>
                    <li>የእኛ ቡድን በ24 ሰዓታት ውስጥ ያግኝዎታል</li>
                    <li>የመክፈያ መረጃ ይላክልዎታል</li>
                    <li>የክፍል መርሐ ግብርዎ ይደረደርልዎታል</li>
                  </ul>
                </div>
                <div className="contact-support">
                  <h4>ጥያቄዎች አሉዎት?</h4>
                  <p>📞 +251 911 234 567</p>
                  <p>✉️ info@nidaulquran.com</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="registration-container">
              {/* Progress Steps */}
              <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">የግል መረጃ</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">የኮርስ ምርጫ</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">ተጨማሪ መረጃ</div>
                </div>
              </div>

              {/* Registration Form */}
              <form className="registration-form" onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="form-step fade-in">
                    <div className="step-header">
                      <User size={32} />
                      <h2>የግል መረጃ</h2>
                      <p>የእርስዎን መሰረታዊ መረጃ ያስገቡ</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="fullName">
                        <User size={18} />
                        ሙሉ ስም *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="ሙሉ ስምዎን ያስገቡ"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">
                          <Mail size={18} />
                          ኢሜይል አድራሻ *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">
                          <Phone size={18} />
                          ስልክ ቁጥር *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+251 911 234 567"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="age">
                          <Calendar size={18} />
                          እድመ *
                        </label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="የእርስዎን እድሜ ያስገቡ"
                          min="5"
                          max="100"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="gender">
                          <Users size={18} />
                          ጾታ *
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">ጾታ ይምረጡ</option>
                          <option value="male">ወንድ</option>
                          <option value="female">ሴት</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-navigation">
                      <button type="button" className="btn btn-next" onClick={nextStep}>
                        ቀጣይ ደረጃ →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Course Selection */}
                {currentStep === 2 && (
                  <div className="form-step fade-in">
                    <div className="step-header">
                      <BookOpen size={32} />
                      <h2>የኮርስ ምርጫ</h2>
                      <p>የሚፈልጉትን ኮርስ ይምረጡ</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="course">
                        <BookOpen size={18} />
                        ኮርስ *
                      </label>
                      <select
                        id="course"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">ኮርስ ይምረጡ</option>
                        <option value="quran-recitation">የቁርኣን ትምህርት (ታጅዊድ)</option>
                        <option value="quran-memorization">የቁርኣን ማስታወሻ (ሂፍዝ)</option>
                        <option value="islamic-studies">የእስላማዊ ጥናቶች</option>
                        <option value="arabic-language">የአረብኛ ቋንቋ</option>
                        <option value="children-program">የህጻናት ፕሮግራም</option>
                        <option value="adult-classes">የአዋቂዎች ክፍሎች</option>
                        <option value="online-learning">የመስመር ላይ ትምህርት</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="level">
                          <Award size={18} />
                          ደረጃ *
                        </label>
                        <select
                          id="level"
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">ደረጃ ይምረጡ</option>
                          <option value="beginner">ጀማሪ</option>
                          <option value="intermediate">መካከለኛ</option>
                          <option value="advanced">ከፍተኛ</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="schedule">
                          <Calendar size={18} />
                          የመርሐ ግብር ምርጫ *
                        </label>
                        <select
                          id="schedule"
                          name="schedule"
                          value={formData.schedule}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">መርሐ ግብር ይምረጡ</option>
                          <option value="morning">ጠዋት (8:00 - 12:00)</option>
                          <option value="afternoon">ከሰዓት በኋላ (2:00 - 5:00)</option>
                          <option value="evening">ምሽት (5:00 - 8:00)</option>
                          <option value="weekend">የቅዳሜና እሁድ</option>
                          <option value="flexible">ተለዋዋጭ</option>
                        </select>
                      </div>
                    </div>

                    <div className="info-box">
                      <h4>💡 ጠቃሚ መረጃ</h4>
                      <ul>
                        <li>ሁሉም ኮርሶች በተመሰከሩ መምህራን ይሰጣሉ</li>
                        <li>የመስመር ላይ እና አካላዊ ክፍሎች ይገኛሉ</li>
                        <li>የመርሐ ግብር ተለዋዋጭነት አለ</li>
                        <li>የምስክር ወረቀት ይሰጣል</li>
                      </ul>
                    </div>

                    <div className="form-navigation">
                      <button type="button" className="btn btn-prev" onClick={prevStep}>
                        ← ወደ ኋላ
                      </button>
                      <button type="button" className="btn btn-next" onClick={nextStep}>
                        ቀጣይ ደረጃ →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Information */}
                {currentStep === 3 && (
                  <div className="form-step fade-in">
                    <div className="step-header">
                      <Award size={32} />
                      <h2>ተጨማሪ መረጃ</h2>
                      <p>ምዝገባዎን ያጠናቅቁ</p>
                    </div>

                    {formData.age && parseInt(formData.age) < 18 && (
                      <>
                        <div className="guardian-section">
                          <h3>የወላጅ/አሳዳጊ መረጃ</h3>
                          <p className="section-note">ለ18 ዓመት በታች ላሉ ተማሪዎች የወላጅ መረጃ ያስፈልጋል</p>
                        </div>

                        <div className="form-group">
                          <label htmlFor="guardian">
                            <User size={18} />
                            የወላጅ/አሳዳጊ ስም *
                          </label>
                          <input
                            type="text"
                            id="guardian"
                            name="guardian"
                            value={formData.guardian}
                            onChange={handleInputChange}
                            placeholder="የወላጅ/አሳዳጊ ሙሉ ስም"
                            required={formData.age && parseInt(formData.age) < 18}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="guardianPhone">
                            <Phone size={18} />
                            የወላጅ/አሳዳጊ ስልክ *
                          </label>
                          <input
                            type="tel"
                            id="guardianPhone"
                            name="guardianPhone"
                            value={formData.guardianPhone}
                            onChange={handleInputChange}
                            placeholder="+251 911 234 567"
                            required={formData.age && parseInt(formData.age) < 18}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label htmlFor="message">
                        ተጨማሪ መረጃ
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="ስለ መማሪያ ግቦችዎ ወይም ሌላ ማንኛውም ጥያቄ ካለዎት እዚህ ይጻፉ..."
                      ></textarea>
                    </div>

                    <div className="terms-section">
                      <label className="checkbox-label">
                        <input type="checkbox" required />
                        <span>
                          <a href="#" className="terms-link">የአገልግሎት ውሎችን</a> እና{' '}
                          <a href="#" className="terms-link">የግላዊነት ፖሊሲን</a> አንብቤ ተስማምቻለሁ
                        </span>
                      </label>
                    </div>

                    <div className="registration-summary">
                      <h3>የምዝገባ ማጠቃለያ</h3>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <strong>ስም:</strong>
                          <span>{formData.fullName || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>ኢሜይል:</strong>
                          <span>{formData.email || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>ስልክ:</strong>
                          <span>{formData.phone || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>ኮርስ:</strong>
                          <span>{formData.course || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>ደረጃ:</strong>
                          <span>{formData.level || '-'}</span>
                        </div>
                        <div className="summary-item">
                          <strong>መርሐ ግብር:</strong>
                          <span>{formData.schedule || '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-navigation">
                      <button type="button" className="btn btn-prev" onClick={prevStep}>
                        ← ወደ ኋላ
                      </button>
                      <button type="submit" className="btn btn-submit-final">
                        ምዝገባ አጠናቅቅ ✓
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Why Register Section */}
      {!isSubmitted && (
        <section className="why-register-section">
          <div className="container">
            <h2>ለምን ከእኛ ጋር መመዝገብ አለብዎት?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🎓</div>
                <h3>የተረጋገጡ መምህራን</h3>
                <p>በየመስኮቻቸው የተረጋገጡ እና ልምድ ያላቸው መምህራን</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📚</div>
                <h3>አጠቃላይ ኮርሶች</h3>
                <p>ሁሉንም ደረጃዎች የሚሸፍኑ የተዋቀሩ ኮርሶች</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🏆</div>
                <h3>ምስክር ወረቀቶች</h3>
                <p>ማጠናቀቅን የሚያረጋግጡ ምስክር ወረቀቶች</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">💰</div>
                <h3>ተመጣጣኝ ዋጋ</h3>
                <p>ለሁሉም የሚደርስ የዋጋ አሰጣጥ</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Register;