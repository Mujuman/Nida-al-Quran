import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, BookOpen, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle,
  Award, Shield, Phone, Mail, Edit3, Save, LogOut, RefreshCw, MessageSquare,
  Video, Sparkles, Check, ChevronRight, UserCheck, BookMarked, Layers, ExternalLink
} from 'lucide-react';
import { apiService } from '../services/apiService';
import '../styles/StudentDashboard.css';

function StudentDashboard({ navigateTo }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getLocalizedText = (textObj, fallback = '') => {
    if (!textObj) return fallback;
    if (typeof textObj === 'string') return textObj;
    if (typeof textObj === 'object') {
      const currentLang = i18n?.language || 'en';
      return textObj[currentLang] || textObj.en || textObj.am || Object.values(textObj).find(v => typeof v === 'string') || fallback;
    }
    return String(textObj);
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'attendance' | 'teacher' | 'profile'
  const [profile, setProfile] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Edit Form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    age: '',
    gender: 'male',
    guardian: '',
    guardianPhone: '',
    learningMedia: 'google-meet',
    schedule: 'morning',
    newPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Filter state for attendance
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!apiService.isAuthenticated()) {
        if (navigateTo) navigateTo('student-login');
        else navigate('/student/login');
        return;
      }

      // Fetch profile
      const profData = await apiService.getMyProfile();
      if (profData && profData.msg === 'Token is not valid') {
        apiService.logout();
        if (navigateTo) navigateTo('student-login');
        else navigate('/student/login');
        return;
      }

      setProfile(profData);
      if (profData) {
        setProfileForm({
          fullName: profData.fullName || '',
          phone: profData.phone || '',
          age: profData.age || '',
          gender: profData.gender || 'male',
          guardian: profData.guardian || '',
          guardianPhone: profData.guardianPhone || '',
          learningMedia: profData.learningMedia || 'google-meet',
          schedule: profData.schedule || 'morning',
        });
      }

      // Fetch attendance
      const attData = await apiService.getMyAttendance();
      if (attData && !attData.msg) {
        setAttendanceData(attData);
      }

      // Fetch courses
      const coursesData = await apiService.getMyCourses();
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      }

      // Fetch teacher
      const teacherRes = await apiService.getMyTeacher();
      if (teacherRes && teacherRes.teacher) {
        setTeacher(teacherRes.teacher);
      } else if (profData && profData.assignedTeacher) {
        setTeacher(profData.assignedTeacher);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    if (navigateTo) navigateTo('home');
    else navigate('/');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await apiService.updateMyProfile(profileForm);
      if (res.user) {
        setProfile(res.user);
        setProfileMessage({
          type: 'success',
          text: t('student.profile.updateSuccess', 'Profile updated successfully!'),
        });
      } else {
        setProfileMessage({ type: 'error', text: res.msg || 'Failed to update profile' });
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setProfileMessage({ type: 'error', text: 'Error saving changes.' });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading your student dashboard...</p>
      </div>
    );
  }

  const attendanceStats = attendanceData?.stats || {
    total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0
  };

  const filteredAttendance = (attendanceData?.attendance || []).filter(item => {
    if (attendanceFilter === 'all') return true;
    return (item.status || '').toLowerCase() === attendanceFilter.toLowerCase();
  });

  return (
    <div className="student-dashboard-layout">
      {/* Dashboard Top Banner */}
      <div className="dashboard-header-bg">
        <div className="container dashboard-header-content">
          <div className="student-profile-summary">
            <div className="student-avatar">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="student-info">
              <div className="student-greeting">
                <Sparkles size={16} /> {t('student.welcomeBack', 'Welcome back')},
              </div>
              <h1 className="student-name">{profile?.fullName || 'Student'}</h1>
              <div className="student-meta-badges">
                <span className="badge badge-course">
                  <BookOpen size={13} /> {getLocalizedText(profile?.course, 'Quran Recitation')}
                </span>
                <span className={`badge badge-status ${profile?.registrationStatus}`}>
                  <CheckCircle2 size={13} /> Status: {profile?.registrationStatus || 'Approved'}
                </span>
                {profile?.level && (
                  <span className="badge badge-level">
                    <Layers size={13} /> Level: {profile.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="btn-refresh" onClick={fetchDashboardData} title="Refresh Dashboard">
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={16} /> {t('student.logout', 'Log Out')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs-wrapper">
        <div className="container dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Award size={18} />
            <span>{t('student.tabs.overview', 'Performance Overview')}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookMarked size={18} />
            <span>{t('student.tabs.courses', 'Enrolled Courses')}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <Calendar size={18} />
            <span>{t('student.tabs.attendance', 'Attendance Record')}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            <UserCheck size={18} />
            <span>{t('student.tabs.teacher', 'Assigned Teacher')}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>{t('student.tabs.profile', 'My Profile')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container dashboard-body">
        {error && (
          <div className="student-alert error mb-4">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="tab-content fade-in">
            {/* Top Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-card metric-primary">
                <div className="metric-icon">
                  <Award size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">{t('student.overview.attendanceRate', 'Attendance Rate')}</span>
                  <div className="metric-value">{attendanceStats.percentage}%</div>
                  <div className="metric-bar-container">
                    <div className="metric-bar-fill" style={{ width: `${Math.min(attendanceStats.percentage, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon green">
                  <CheckCircle2 size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Classes Attended</span>
                  <div className="metric-value">{attendanceStats.present + attendanceStats.late} / {attendanceStats.total}</div>
                  <span className="metric-subtext">{attendanceStats.present} Present, {attendanceStats.late} Late</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon blue">
                  <BookOpen size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">{t('student.overview.enrolledCourses', 'Enrolled Course')}</span>
                  <div className="metric-value text-truncate">{getLocalizedText(profile?.course, 'Quran Studies')}</div>
                  <span className="metric-subtext">Level: {profile?.level || 'Beginner'}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon gold">
                  <UserCheck size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Assigned Instructor</span>
                  <div className="metric-value text-truncate">{teacher ? teacher.fullName : 'Assigning...'}</div>
                  <span className="metric-subtext">{teacher ? teacher.email : 'Check Teacher Tab'}</span>
                </div>
              </div>
            </div>

            {/* Performance Detail Grid */}
            <div className="overview-details-grid">
              <div className="dashboard-card shadow-card">
                <div className="card-header">
                  <h3><Sparkles size={20} className="text-gold" /> Performance & Learning Progress</h3>
                </div>
                <div className="card-body">
                  {(() => {
                    const totalClasses = attendanceStats.total || 0;
                    const pct = attendanceStats.percentage || 0;
                    const isHifz = (profile?.course || '').toLowerCase().includes('hifz') || (profile?.course || '').toLowerCase().includes('memorization');

                    let tajweedText = 'Awaiting Evaluation';
                    let tajweedPct = 0;
                    let tajweedClass = 'text-muted';

                    let courseProgressTitle = isHifz ? 'Memorization (Hifz) & Revision' : 'Course Mastery & Revision';
                    let courseProgressText = 'Awaiting Evaluation';
                    let courseProgressPct = 0;

                    if (totalClasses > 0) {
                      if (pct >= 85) {
                        tajweedText = 'Excellent';
                        tajweedPct = Math.min(pct + 5, 100);
                        tajweedClass = 'text-gold';
                        courseProgressText = 'Strong Progress';
                        courseProgressPct = pct;
                      } else if (pct >= 60) {
                        tajweedText = 'Good Progress';
                        tajweedPct = pct;
                        tajweedClass = 'text-blue';
                        courseProgressText = 'Steady Progress';
                        courseProgressPct = pct;
                      } else {
                        tajweedText = 'Needs Attention';
                        tajweedPct = Math.max(pct, 25);
                        tajweedClass = 'text-red';
                        courseProgressText = 'Requires Practice';
                        courseProgressPct = Math.max(pct, 20);
                      }
                    } else {
                      const level = (profile?.level || 'intermediate').toLowerCase();
                      if (level === 'advanced') {
                        tajweedText = 'Advanced Level';
                        tajweedPct = 85;
                        tajweedClass = 'text-gold';
                        courseProgressText = 'Advanced Track';
                        courseProgressPct = 80;
                      } else if (level === 'intermediate') {
                        tajweedText = 'Intermediate Level';
                        tajweedPct = 65;
                        tajweedClass = 'text-blue';
                        courseProgressText = 'Standard Track';
                        courseProgressPct = 60;
                      } else {
                        tajweedText = 'Beginner Foundation';
                        tajweedPct = 45;
                        tajweedClass = 'text-green';
                        courseProgressText = 'Introductory Track';
                        courseProgressPct = 40;
                      }
                    }

                    return (
                      <>
                        <div className="progress-item">
                          <div className="progress-info">
                            <span>Tajweed & Pronunciation</span>
                            <strong className={tajweedClass}>{tajweedText}</strong>
                          </div>
                          <div className="progress-track"><div className="progress-fill" style={{ width: `${tajweedPct}%` }}></div></div>
                        </div>

                        <div className="progress-item">
                          <div className="progress-info">
                            <span>{courseProgressTitle}</span>
                            <strong className="text-blue">{courseProgressText}</strong>
                          </div>
                          <div className="progress-track"><div className="progress-fill blue" style={{ width: `${courseProgressPct}%` }}></div></div>
                        </div>

                        <div className="progress-item">
                          <div className="progress-info">
                            <span>Class Participation & Punctuality</span>
                            <strong>{totalClasses > 0 ? `${pct}%` : '0%'}</strong>
                          </div>
                          <div className="progress-track"><div className="progress-fill green" style={{ width: `${totalClasses > 0 ? Math.min(pct, 100) : 0}%` }}></div></div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="performance-summary-box">
                    <h4>Current Academic Standing</h4>
                    <p>
                      Student is registered in <strong>{profile?.course || 'Quran Recitation'}</strong> ({profile?.level || 'Intermediate'}). 
                      Teaching session medium is set to <strong>{profile?.learningMedia || 'Google Meet'}</strong> with a <strong>{profile?.schedule || 'Morning'}</strong> schedule.
                      {attendanceStats.total > 0 ? ` Total sessions recorded: ${attendanceStats.total} (${attendanceStats.present} Present, ${attendanceStats.absent} Absent, ${attendanceStats.late} Late).` : ' No attendance sessions logged yet.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-card shadow-card">
                <div className="card-header">
                  <h3><MessageSquare size={20} className="text-blue" /> Latest Teacher Suggestions</h3>
                </div>
                <div className="card-body">
                  {attendanceData?.attendance && attendanceData.attendance.find(a => a.teacherSuggestion || a.notes) ? (
                    <div className="feedback-list">
                      {attendanceData.attendance
                        .filter(a => a.teacherSuggestion || a.notes)
                        .slice(0, 3)
                        .map((att, idx) => (
                          <div key={idx} className="feedback-card">
                            <div className="feedback-date">
                              <Calendar size={14} /> {new Date(att.date).toLocaleDateString()}
                            </div>
                            {att.teacherSuggestion && (
                              <p className="feedback-text">
                                <strong>Suggestion:</strong> {att.teacherSuggestion}
                              </p>
                            )}
                            {att.notes && (
                              <p className="feedback-notes">
                                <strong>Notes:</strong> {att.notes}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <MessageSquare size={36} />
                      <p>No specific teacher suggestions recorded yet.</p>
                      <small>Your teacher will provide notes after class sessions.</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ENROLLED COURSES ==================== */}
        {activeTab === 'courses' && (
          <div className="tab-content fade-in">
            <div className="section-title-wrapper">
              <h2><BookMarked size={24} /> {t('student.tabs.courses', 'Enrolled Courses')}</h2>
              <p>View details of your active registered courses at Nida Al-Quran Center</p>
            </div>

            <div className="courses-grid">
              {courses.length > 0 ? (
                courses.map((course, idx) => (
                  <div key={idx} className="course-card shadow-card">
                    <div className="course-card-header">
                      <div className="course-icon">
                        <BookOpen size={24} />
                      </div>
                      <span className={`status-pill ${course.status}`}>
                        {course.status}
                      </span>
                    </div>

                    <h3 className="course-title">{getLocalizedText(course.title, 'Course Title')}</h3>
                    <p className="course-desc">{getLocalizedText(course.description, '')}</p>

                    <div className="course-details-list">
                      <div className="detail-item">
                        <Layers size={16} />
                        <span>Level: <strong>{course.level}</strong></span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>Schedule: <strong>{course.schedule}</strong></span>
                      </div>
                      <div className="detail-item">
                        <Video size={16} />
                        <span>Platform: <strong>{course.learningMedia}</strong></span>
                      </div>
                      <div className="detail-item">
                        <Shield size={16} />
                        <span>Teaching Active: <strong>{course.isTeachingActive !== false ? 'Yes' : 'Paused'}</strong></span>
                      </div>
                    </div>

                    <div className="course-card-footer">
                      <div className="instructor-mini">
                        <UserCheck size={16} />
                        <span>Instructor: {teacher ? teacher.fullName : 'Assigned Admin'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-card shadow-card">
                  <div className="empty-state">
                    <BookOpen size={48} />
                    <h3>No course currently listed</h3>
                    <p>Your registered course ({getLocalizedText(profile?.course, 'Selected Course')}) is being configured.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ATTENDANCE RECORD ==================== */}
        {activeTab === 'attendance' && (
          <div className="tab-content fade-in">
            <div className="attendance-header-bar">
              <div>
                <h2><Calendar size={24} /> {t('student.tabs.attendance', 'Attendance History')}</h2>
                <p>Complete logs of your past classes and teacher evaluations</p>
              </div>

              <div className="attendance-filters">
                <button
                  className={`filter-btn ${attendanceFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setAttendanceFilter('all')}
                >
                  All ({attendanceStats.total})
                </button>
                <button
                  className={`filter-btn ${attendanceFilter === 'present' ? 'active' : ''}`}
                  onClick={() => setAttendanceFilter('present')}
                >
                  Present ({attendanceStats.present})
                </button>
                <button
                  className={`filter-btn ${attendanceFilter === 'absent' ? 'active' : ''}`}
                  onClick={() => setAttendanceFilter('absent')}
                >
                  Absent ({attendanceStats.absent})
                </button>
                <button
                  className={`filter-btn ${attendanceFilter === 'late' ? 'active' : ''}`}
                  onClick={() => setAttendanceFilter('late')}
                >
                  Late ({attendanceStats.late})
                </button>
              </div>
            </div>

            <div className="dashboard-card shadow-card">
              {filteredAttendance.length > 0 ? (
                <div className="table-responsive">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>{t('student.attendance.date', 'Date')}</th>
                        <th>{t('student.attendance.course', 'Course')}</th>
                        <th>{t('student.attendance.status', 'Status')}</th>
                        <th>{t('student.attendance.time', 'Time / Place')}</th>
                        <th>{t('student.attendance.notes', 'Teacher Suggestions & Notes')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((record) => (
                        <tr key={record._id}>
                          <td className="font-semibold">
                            {new Date(record.date).toLocaleDateString(undefined, {
                              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </td>
                          <td>
                            <span className="course-name-tag">{record.course}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${record.status}`}>
                              {record.status === 'present' && <CheckCircle2 size={14} />}
                              {record.status === 'absent' && <XCircle size={14} />}
                              {record.status === 'late' && <Clock size={14} />}
                              {record.status === 'excused' && <AlertTriangle size={14} />}
                              {record.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {record.startTime ? `${record.startTime} - ${record.endTime || ''}` : 'Scheduled Class'}
                            {record.learningPlace && <div className="text-muted small">{record.learningPlace}</div>}
                          </td>
                          <td>
                            {record.teacherSuggestion && (
                              <div className="suggestion-text">
                                💡 <strong>Suggestion:</strong> {record.teacherSuggestion}
                              </div>
                            )}
                            {record.notes && <div className="note-text">📝 {record.notes}</div>}
                            {!record.teacherSuggestion && !record.notes && <span className="text-muted">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar size={48} />
                  <h3>No attendance records found</h3>
                  <p>Attendance records marked by your instructor will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ASSIGNED TEACHER ==================== */}
        {activeTab === 'teacher' && (
          <div className="tab-content fade-in">
            <div className="section-title-wrapper">
              <h2><UserCheck size={24} /> {t('student.teacher.assignedTitle', 'Your Assigned Instructor')}</h2>
              <p>Get in touch with your assigned teacher at Nida Al-Quran</p>
            </div>

            {teacher ? (
              <div className="teacher-profile-card shadow-card">
                <div className="teacher-card-top">
                  <div className="teacher-avatar">
                    {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="teacher-primary-info">
                    <h3>{teacher.fullName}</h3>
                    <span className="teacher-role-badge">
                      <Shield size={14} /> Certified Instructor ({teacher.role === 'main_admin' ? 'Lead Admin' : 'Sub-Admin Teacher'})
                    </span>
                    <span className="teacher-status-online">● Active Teaching Status</span>
                  </div>
                </div>

                <div className="teacher-details-grid">
                  <div className="teacher-info-item">
                    <Mail size={18} className="icon" />
                    <div>
                      <label>{t('student.teacher.email', 'Email Address')}</label>
                      <p>{teacher.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="teacher-info-item">
                    <Phone size={18} className="icon" />
                    <div>
                      <label>{t('student.teacher.phone', 'Phone Number')}</label>
                      <p>{teacher.phone || '+251 (Center Direct Line)'}</p>
                    </div>
                  </div>

                  <div className="teacher-info-item full-width">
                    <BookOpen size={18} className="icon" />
                    <div>
                      <label>{t('student.teacher.courses', 'Assigned Courses')}</label>
                      <div className="courses-tags">
                        {teacher.assignedCourses && teacher.assignedCourses.length > 0 ? (
                          teacher.assignedCourses.map((c, i) => (
                            <span key={i} className="tag-pill">{getLocalizedText(c)}</span>
                          ))
                        ) : (
                          <span className="tag-pill">{getLocalizedText(profile?.course, 'Quran Studies')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="teacher-actions">
                  {teacher.email && (
                    <a href={`mailto:${teacher.email}`} className="btn btn-primary">
                      <Mail size={16} /> Send Email to Instructor
                    </a>
                  )}
                  {teacher.phone && (
                    <a href={`tel:${teacher.phone}`} className="btn btn-secondary">
                      <Phone size={16} /> Call Teacher
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashboard-card shadow-card">
                <div className="empty-state">
                  <UserCheck size={54} className="text-gold" />
                  <h3>Teacher Assignment Pending</h3>
                  <p className="max-w-md">
                    {t('student.teacher.noTeacher', 'Your instructor assignment is currently being processed by administration. You will be notified once assigned.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 5: MY PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="tab-content fade-in">
            <div className="section-title-wrapper">
              <h2><User size={24} /> {t('student.profile.title', 'Profile & Account Settings')}</h2>
              <p>Update your personal information, contact numbers, and security credentials</p>
            </div>

            <div className="dashboard-card shadow-card">
              {profileMessage.text && (
                <div className={`student-alert ${profileMessage.type} mb-4`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Guardian Name</label>
                    <input
                      type="text"
                      value={profileForm.guardian}
                      onChange={(e) => setProfileForm({ ...profileForm, guardian: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Guardian Phone</label>
                    <input
                      type="text"
                      value={profileForm.guardianPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, guardianPhone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Preferred Learning Media</label>
                    <select
                      value={profileForm.learningMedia}
                      onChange={(e) => setProfileForm({ ...profileForm, learningMedia: e.target.value })}
                    >
                      <option value="google-meet">Google Meet</option>
                      <option value="zoom">Zoom</option>
                      <option value="telegram">Telegram</option>
                      <option value="skype">Skype</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred Schedule</label>
                    <input
                      type="text"
                      value={profileForm.schedule}
                      onChange={(e) => setProfileForm({ ...profileForm, schedule: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#17473c', fontWeight: 700, marginBottom: '0.5rem' }}>
                      <Shield size={18} /> Account Credentials & Security
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Registered Email Address:</span>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', marginTop: '2px' }}>{profile?.email || 'N/A'}</div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5, background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        🔒 <strong>Security Note:</strong> Email addresses and login passwords for registered students are managed exclusively by the <strong>Main Administration</strong>. If you need to reset your password or change your email address, please contact the main administrator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-actions mt-4">
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? (
                      'Saving Changes...'
                    ) : (
                      <>
                        <Save size={18} /> {t('student.profile.saveBtn', 'Save Profile Changes')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
