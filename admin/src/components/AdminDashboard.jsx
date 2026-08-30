import { useState, useEffect, useCallback } from 'react';
import {
  Users, Mail, BarChart3, LogOut, Menu, X, Clock, CheckCircle,
  XCircle, Eye, Trash2, Send, Calendar, Filter, Search, Download,
  UserCheck, AlertCircle, Shield, ShieldCheck, UserPlus, Edit2,
  BookOpen
} from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { getLanguage, getTranslation } from '../i18n';

function AdminDashboard() {
  const navigate = useNavigate();
  const adminInfo = apiService.getAdminInfo();
  const isMainAdmin = adminInfo?.role === 'main_admin';
  const [language, setLanguage] = useState(getLanguage);
  const t = (key) => getTranslation(language, key);

  const toggleLanguage = () => {
    const nextLanguage = language === 'en' ? 'am' : 'en';
    localStorage.setItem('adminLanguage', nextLanguage);
    setLanguage(nextLanguage);
  };

  const [stats, setStats] = useState({
    totalUsers: 0, pendingRegistrations: 0, approvedRegistrations: 0,
    totalContacts: 0, newContacts: 0, monthlyAttendance: 0, totalSubAdmins: 0,
  });
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateSubAdminModal, setShowCreateSubAdminModal] = useState(false);
  const [showEditSubAdminModal, setShowEditSubAdminModal] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [newSubAdmin, setNewSubAdmin] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    assignedCourses: [],
  });
  const [editSubAdminForm, setEditSubAdminForm] = useState({
    fullName: '',
    phone: '',
    assignedCourses: [],
    isActive: true,
    password: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceCourse, setAttendanceCourse] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState(null);
  const [assignedSubAdminId, setAssignedSubAdminId] = useState('');
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    slug: '', title: { en: '', am: '' }, description: { en: '', am: '' },
    features: { en: '', am: '' }, sortOrder: 0, isActive: true,
  });
  const [attendanceMarking, setAttendanceMarking] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    course: '',
    notes: '',
    startTime: '',
    endTime: '',
    learningPlace: '',
    teacherSuggestion: '',
    absenceReason: '',
    permissionStatus: 'not-required',
    permissionNote: '',
  });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const handleOpenUser = async (user) => {
    try {
      const userDetails = await apiService.getUserDetails(user._id || user.id);
      if (!userDetails || userDetails.msg || !(userDetails._id || userDetails.id)) {
        throw new Error(userDetails?.msg || 'Unable to load student details.');
      }
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      showMessage(err?.message || 'Unable to load student details.', 'error');
    }
  };

  const handleOpenContact = async (contact) => {
    try {
      const contactDetails = await apiService.getContactById(contact._id || contact.id);
      setSelectedContact(contactDetails);
      setReplyText(contactDetails.reply || '');
      setShowReplyModal(true);
    } catch (err) {
      console.error('Error fetching contact details:', err);
      showMessage(err?.message || 'Unable to load message details.', 'error');
    }
  };

  const handleUserStatusUpdate = async (nextStatus) => {
    if (!selectedUser) return;
    try {
      await apiService.updateUserStatus(selectedUser._id || selectedUser.id, {
        registrationStatus: nextStatus,
      });
      showMessage('Student status updated.', 'success');
      setSelectedUser((prev) => ({ ...prev, registrationStatus: nextStatus }));
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating user status:', err);
      showMessage(err?.message || 'Unable to update student status.', 'error');
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedContact || !replyText.trim()) {
      showMessage('Please enter a reply before sending.', 'error');
      return;
    }

    try {
      const response = await apiService.replyContact(selectedContact._id || selectedContact.id, replyText.trim());
      showMessage(response?.msg || 'Reply sent successfully.', 'success');
      if (response?.contact) {
        setSelectedContact(response.contact);
      } else {
        setSelectedContact((prev) => ({ ...prev, reply: replyText.trim(), status: 'replied' }));
      }
      setReplyText('');
      fetchDashboardData();
    } catch (err) {
      console.error('Error sending reply:', err);
      showMessage(err?.message || 'Unable to send reply.', 'error');
    }
  };

  const handleCreateSubAdmin = async (event) => {
    event.preventDefault();

    if (newSubAdmin.assignedCourses.length === 0) {
      showMessage('Please assign at least one course.', 'error');
      return;
    }

    try {
      const response = await apiService.createSubAdmin(newSubAdmin);
      showMessage(response?.msg || 'Sub-admin created successfully.', 'success');
      setShowCreateSubAdminModal(false);
      setNewSubAdmin({ username: '', email: '', password: '', fullName: '', phone: '', assignedCourses: [] });
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating sub-admin:', err);
      showMessage(err?.message || 'Could not create sub-admin.', 'error');
    }
  };

  const handleOpenEditSubAdmin = (admin) => {
    setSelectedSubAdmin(admin);
    setEditSubAdminForm({
      fullName: admin.fullName || '',
      phone: admin.phone || '',
      assignedCourses: Array.isArray(admin.assignedCourses) ? [...admin.assignedCourses] : [],
      isActive: admin.isActive !== false,
      password: '',
    });
    setShowEditSubAdminModal(true);
  };

  const handleUpdateSubAdmin = async (event) => {
    event.preventDefault();
    if (!selectedSubAdmin) return;

    try {
      const payload = {
        fullName: editSubAdminForm.fullName,
        phone: editSubAdminForm.phone,
        assignedCourses: editSubAdminForm.assignedCourses,
        isActive: editSubAdminForm.isActive,
      };

      if (editSubAdminForm.password.trim()) {
        payload.password = editSubAdminForm.password.trim();
      }

      const response = await apiService.updateSubAdmin(selectedSubAdmin._id || selectedSubAdmin.id, payload);
      showMessage(response?.msg || 'Teacher updated successfully.', 'success');
      setShowEditSubAdminModal(false);
      setSelectedSubAdmin(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating sub-admin:', err);
      showMessage(err?.message || 'Could not update teacher account.', 'error');
    }
  };

  const handleDeleteSubAdmin = async (admin) => {
    const adminId = admin._id || admin.id;
    const confirmed = window.confirm(`Delete teacher ${admin.fullName || admin.username}? This will unassign their students.`);
    if (!confirmed) return;

    try {
      const response = await apiService.deleteSubAdmin(adminId);
      showMessage(response?.msg || 'Teacher deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting sub-admin:', err);
      showMessage(err?.message || 'Could not delete teacher account.', 'error');
    }
  };

  const handleDeleteRejectedStudent = async (student) => {
    const studentId = student._id || student.id;
    const confirmed = window.confirm(`Delete student ${student.fullName || student.name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await apiService.deleteUser(studentId);
      showMessage(response?.msg || 'Student deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting student:', err);
      showMessage(err?.message || 'Could not delete student.', 'error');
    }
  };

  const handleToggleSubAdminStatus = async (admin) => {
    const adminId = admin._id || admin.id;
    const nextState = !admin.isActive;
    try {
      const response = await apiService.toggleSubAdminStatus(adminId, nextState);
      showMessage(response?.msg || `Teacher ${nextState ? 'activated' : 'deactivated'} successfully.`, 'success');
      fetchDashboardData();
    } catch (err) {
      console.error('Error toggling sub-admin status:', err);
      showMessage(err?.message || 'Could not change teacher account status.', 'error');
    }
  };

  const handleMarkContactAsRead = async () => {
    if (!selectedContact) return;
    try {
      const response = await apiService.markContactAsRead(selectedContact._id || selectedContact.id);
      showMessage('Message marked as read.', 'success');
      setSelectedContact((prev) => ({ ...prev, ...response, status: 'read' }));
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking contact as read:', err);
      showMessage(err?.message || 'Unable to mark message as read.', 'error');
    }
  };

  const handleMarkContactAsSpam = async () => {
    if (!selectedContact) return;
    try {
      await apiService.markContactAsSpam(selectedContact._id || selectedContact.id);
      showMessage('Message marked as spam.', 'success');
      setSelectedContact((prev) => ({ ...prev, isSpam: true }));
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking contact as spam:', err);
      showMessage(err?.message || 'Unable to flag message as spam.', 'error');
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsResponse = await apiService.getDashboardStats();
      setStats(statsResponse);

      if (activeTab === 'dashboard' || activeTab === 'users') {
        const usersResponse = await apiService.getAllUsers();
        setUsers(Array.isArray(usersResponse) ? usersResponse : []);
        if (isMainAdmin) {
          const saResponse = await apiService.getSubAdmins();
          setSubAdmins(Array.isArray(saResponse) ? saResponse : []);
        }
      }
      if (activeTab === 'contacts' && isMainAdmin) {
        const contactsResponse = await apiService.getAllContacts();
        setContacts(Array.isArray(contactsResponse) ? contactsResponse : []);
      }
      if (activeTab === 'attendance') {
        const attendanceResponse = await apiService.getAllAttendance();
        setAttendance(Array.isArray(attendanceResponse) ? attendanceResponse : []);
        if (users.length === 0) {
          const usersResponse = await apiService.getAllUsers();
          setUsers(Array.isArray(usersResponse) ? usersResponse : []);
        }
        if (isMainAdmin) {
          const saResponse = await apiService.getSubAdmins();
          setSubAdmins(Array.isArray(saResponse) ? saResponse : []);
        }
      }
      if (activeTab === 'assign-students' && isMainAdmin) {
        // Fetch approved students only
        const allUsersResponse = await apiService.getAllUsers();
        const approvedUsers = Array.isArray(allUsersResponse) 
          ? allUsersResponse.filter(u => u.registrationStatus === 'approved')
          : [];
        setUsers(approvedUsers);
        const saResponse = await apiService.getSubAdmins();
        setSubAdmins(Array.isArray(saResponse) ? saResponse : []);
      }
      if (activeTab === 'subadmins' && isMainAdmin) {
        const saResponse = await apiService.getSubAdmins();
        setSubAdmins(Array.isArray(saResponse) ? saResponse : []);
      }
      if ((activeTab === 'courses' || activeTab === 'subadmins') && isMainAdmin) {
        const coursesResponse = await apiService.getCourses();
        setCourses(Array.isArray(coursesResponse) ? coursesResponse : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showMessage(`Error loading data: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isMainAdmin, users.length]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!isMainAdmin && activeTab === 'contacts') {
      setActiveTab('dashboard');
    }
  }, [activeTab, isMainAdmin]);

  const handleLogout = () => {
    apiService.clearToken(true);
    navigate('/login');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setSearchTerm('');
    setFilterStatus('all');
  };

  const handleAssignStudent = async () => {
    if (!selectedStudentForAssign || !assignedSubAdminId) {
      showMessage('Please select a student and a sub-admin.', 'error');
      return;
    }

    try {
      await apiService.assignStudentToTeacher(
        selectedStudentForAssign._id || selectedStudentForAssign.id,
        assignedSubAdminId
      );
      showMessage('Student assigned successfully.', 'success');
      setShowAssignModal(false);
      setSelectedStudentForAssign(null);
      setAssignedSubAdminId('');
      fetchDashboardData();
    } catch (err) {
      console.error('Error assigning student:', err);
      showMessage(err?.message || 'Unable to assign student.', 'error');
    }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceMarking.studentId || !attendanceMarking.date) {
      showMessage('Please select a student and date.', 'error');
      return;
    }

    try {
      await apiService.markAttendance(attendanceMarking);
      showMessage('Attendance marked successfully.', 'success');
      setShowMarkAttendanceModal(false);
      setAttendanceMarking({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        course: '',
        notes: '',
        startTime: '',
        endTime: '',
        learningPlace: '',
        teacherSuggestion: '',
        absenceReason: '',
        permissionStatus: 'not-required',
        permissionNote: '',
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking attendance:', err);
      showMessage(err?.message || 'Unable to mark attendance.', 'error');
    }
  };

  const openCourseModal = (course = null) => {
    setEditingCourse(course);
    setCourseForm(course ? {
      slug: course.slug,
      title: course.title,
      description: course.description,
      features: {
        en: course.features?.en?.join('\n') || '',
        am: course.features?.am?.join('\n') || '',
      },
      sortOrder: course.sortOrder || 0,
      isActive: course.isActive,
    } : {
      slug: '', title: { en: '', am: '' }, description: { en: '', am: '' },
      features: { en: '', am: '' }, sortOrder: courses.length, isActive: true,
    });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...courseForm,
      features: {
        en: courseForm.features.en.split('\n').map((item) => item.trim()).filter(Boolean),
        am: courseForm.features.am.split('\n').map((item) => item.trim()).filter(Boolean),
      },
      sortOrder: Number(courseForm.sortOrder) || 0,
    };
    const response = editingCourse
      ? await apiService.updateCourse(editingCourse.id, payload)
      : await apiService.createCourse(payload);
    if (response?.msg && !response.id) {
      showMessage(response.msg, 'error');
      return;
    }
    showMessage(editingCourse ? 'Course updated successfully.' : 'Course created successfully.');
    setShowCourseModal(false);
    fetchDashboardData();
  };

  const handleArchiveCourse = async (course) => {
    if (!window.confirm(`Archive ${course.title?.en || course.slug}?`)) return;
    const response = await apiService.archiveCourse(course.id);
    if (response?.msg && !response.id) {
      showMessage(response.msg, 'error');
      return;
    }
    showMessage('Course archived successfully.');
    fetchDashboardData();
  };

  const handleDeleteCoursePermanently = async (course) => {
    if (!window.confirm(`Permanently delete ${course.title?.en || course.slug}? This cannot be undone.`)) return;
    const response = await apiService.deleteCoursePermanently(course.id);
    if (response?.msg && !response.id) {
      showMessage(response.msg, 'error');
      return;
    }
    showMessage('Course permanently deleted.');
    fetchDashboardData();
  };

  const statsCards = [
    { label: t('totalStudents'), value: stats.totalUsers || 0, icon: Users, color: 'blue' },
    { label: t('pending'), value: stats.pendingRegistrations || 0, icon: Clock, color: 'gold' },
    { label: t('approved'), value: stats.approvedRegistrations || 0, icon: CheckCircle, color: 'green' },
    ...(isMainAdmin ? [
      { label: t('messagesCount'), value: stats.totalContacts || 0, icon: Mail, color: 'purple' },
    ] : []),
  ];
  const statusChartData = [
    { name: 'Pending', value: users.filter((user) => user.registrationStatus === 'pending').length },
    { name: 'Approved', value: users.filter((user) => user.registrationStatus === 'approved').length },
    { name: 'Rejected', value: users.filter((user) => user.registrationStatus === 'rejected').length },
  ];
  const courseChartData = Object.entries(users.reduce((courseCounts, user) => {
    const course = user.course || 'Not specified';
    courseCounts[course] = (courseCounts[course] || 0) + 1;
    return courseCounts;
  }, {})).map(([name, students]) => ({
    name: name.replace(/-/g, ' '),
    students,
  }));
  const chartColors = ['#c69a4b', '#17473c', '#984d45'];
  const recentStudents = [...users]
    .sort((firstStudent, secondStudent) => (
      new Date(secondStudent.createdAt || 0) - new Date(firstStudent.createdAt || 0)
    ))
    .slice(0, 5);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const matchesSearch = (values) => !normalizedSearchTerm || values.some((value) => (
    String(value || '').toLowerCase().includes(normalizedSearchTerm)
  ));
  const filteredRecentStudents = recentStudents.filter((student) => matchesSearch([
    student.fullName, student.email, student.registrationStatus,
  ]));
  const filteredUsers = users.filter((user) => matchesSearch([
    user.fullName, user.email, user.registrationStatus,
  ]));
  const filteredContacts = contacts.filter((contact) => matchesSearch([
    contact.fullName, contact.name, contact.email, contact.message,
  ]));
  const filteredAttendance = attendance.filter((item) => matchesSearch([
    item.student?.fullName, item.studentName, item.course, item.recordedBy?.fullName,
    item.status, item.learningPlace, item.teacherSuggestion, item.absenceReason,
    item.date && new Date(item.date).toLocaleDateString(),
  ]));
  const filteredSubAdmins = subAdmins.filter((admin) => matchesSearch([
    admin.fullName, admin.email, admin.username, admin.role,
  ]));
  const searchBar = (placeholder) => (
    <div className="admin-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {searchTerm && (
        <button type="button" className="search-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="header-brand">
              <ShieldCheck size={18} />
              <span>Nida Al-Quran Admin</span>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-badge">
              <div className="admin-avatar">{adminInfo?.fullName?.charAt(0) || 'A'}</div>
              <div className="admin-info">
                <span className="admin-name">{adminInfo?.fullName || 'Admin'}</span>
                <span className={`admin-role-tag ${isMainAdmin ? 'main' : 'sub'}`}>
                  {isMainAdmin ? 'Main Admin' : 'Teacher'}
                </span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={16} />
              {t('logout')}
            </button>
            <button className="language-toggle" onClick={toggleLanguage} aria-label="Change language">
              {t('language')}
            </button>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={`toast-alert toast-${message.type}`} role="alert" aria-live="assertive">
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="admin-layout">
        {sidebarOpen && (
          <div
            className="sidebar-overlay show"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">{t('management')}</div>
          <nav className="sidebar-nav">
            {[
              { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
              { id: 'users', label: t('students'), icon: Users },
              ...(isMainAdmin ? [{ id: 'contacts', label: t('messages'), icon: Mail }] : []),
              { id: 'attendance', label: t('attendance'), icon: Calendar },
              ...(isMainAdmin ? [
                { id: 'assign-students', label: t('assignStudents'), icon: UserCheck },
                { id: 'subadmins', label: t('subAdmins'), icon: UserPlus },
                { id: 'courses', label: t('courses'), icon: BookOpen },
              ] : []),
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${activeTab === id ? 'active' : ''}`}
                onClick={() => switchTab(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{t('overview')}</p>
                  <h2>{t('dashboard')}</h2>
                </div>
              </div>

              <div className="stats-grid">
                {statsCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`stat-card ${color}`}>
                    <div className="stat-icon"><Icon size={20} /></div>
                    <div className="stat-meta">
                      <span className="stat-label">{label}</span>
                      <strong className="stat-value">{value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {isMainAdmin && (
                <div className="dashboard-charts">
                  <section className="chart-card status-chart-card">
                    <div className="chart-header">
                      <div>
                        <p className="eyebrow">Registration overview</p>
                        <h3>Student status</h3>
                      </div>
                      <CheckCircle size={19} />
                    </div>
                    <div className="chart-body pie-chart-body">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="78%" paddingAngle={3}>
                            {statusChartData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={28} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="chart-center-value"><strong>{users.length}</strong><span>students</span></div>
                    </div>
                  </section>

                  <section className="chart-card course-chart-card">
                    <div className="chart-header">
                      <div>
                        <p className="eyebrow">Programme demand</p>
                        <h3>Students by course</h3>
                      </div>
                      <BookOpen size={19} />
                    </div>
                    <div className="chart-body">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseChartData} margin={{ top: 10, right: 8, left: -18, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d8e1d8" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#66766e' }} interval={0} angle={-12} textAnchor="end" height={52} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#66766e' }} />
                          <Tooltip cursor={{ fill: 'rgba(198, 154, 75, 0.1)' }} />
                          <Bar dataKey="students" fill="#17473c" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="chart-card attendance-chart-card">
                    <div className="chart-header">
                      <div>
                        <p className="eyebrow">Monthly activity</p>
                        <h3>Attendance recorded</h3>
                      </div>
                      <Calendar size={19} />
                    </div>
                    <div className="attendance-summary">
                      <strong>{stats.monthlyAttendance || 0}</strong>
                      <span>records this month</span>
                      <div className="attendance-meter"><span style={{ width: `${Math.min((stats.monthlyAttendance || 0) * 4, 100)}%` }} /></div>
                    </div>
                  </section>
                </div>
              )}

              <div className="recent-students-section">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{t('latestActivity')}</p>
                    <h3>{t('recentStudents')}</h3>
                  </div>
                  <button className="btn-secondary" onClick={() => switchTab('users')}>
                    {t('viewAllStudents')}
                  </button>
                </div>
                {searchBar(t('searchStudents'))}

                <div className="table-card">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Registered</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecentStudents.length > 0 ? filteredRecentStudents.map((student) => (
                        <tr key={student._id || student.id}>
                          <td>{student.fullName || student.name || 'Unknown'}</td>
                          <td>{student.email || '-'}</td>
                          <td>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}</td>
                          <td>
                            <span className={`status-badge ${student.registrationStatus || 'pending'}`}>
                              {student.registrationStatus || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <button className="mini-btn" onClick={() => handleOpenUser(student)}>
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="empty-table-message">No matching students found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{t('students')}</p>
                  <h2>{t('studentManagement')}</h2>
                </div>
              </div>
              {searchBar(t('searchStudents'))}
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id || user.id}>
                        <td>{user.fullName || user.name || 'Unknown'}</td>
                        <td>{user.email || '-'}</td>
                        <td>
                          <span className={`status-badge ${user.registrationStatus || 'pending'}`}>
                            {user.registrationStatus || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button className="mini-btn" onClick={() => handleOpenUser(user)}>
                            <Eye size={14} />
                          </button>
                          {isMainAdmin && user.registrationStatus === 'rejected' && (
                            <button 
                              className="mini-btn delete-btn" 
                              onClick={() => handleDeleteRejectedStudent(user)}
                              title="Delete rejected student"
                              aria-label="Delete student"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && isMainAdmin && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{t('messages')}</p>
                  <h2>{t('contactMessages')}</h2>
                </div>
              </div>
              {searchBar(t('searchMessages'))}
              <div className="table-card contact-messages-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact._id || contact.id}>
                        <td>{contact.fullName || contact.name || 'Unknown'}</td>
                        <td>{contact.email || '-'}</td>
                        <td>{contact.message?.slice(0, 60) || '-'}</td>
                        <td>
                          <button className="mini-btn" onClick={() => handleOpenContact(contact)}>
                            <Mail size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{t('attendance')}</p>
                  <h2>{t('attendanceManagement')}</h2>
                </div>
                {!isMainAdmin && (
                  <button className="btn-primary" onClick={() => setShowMarkAttendanceModal(true)}>
                    + {t('markAttendance')}
                  </button>
                )}
              </div>
              {searchBar(t('searchAttendance'))}
              <div className="table-card attendance-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Place</th>
                      <th>Recorded By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((item) => (
                      <tr key={item._id || item.id}>
                        <td>{item.student?.fullName || item.studentName || 'Unknown'}</td>
                        <td>{item.course || '-'}</td>
                        <td>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                        <td>{item.startTime || item.endTime ? `${item.startTime || '-'} - ${item.endTime || '-'}` : '-'}</td>
                        <td>{item.learningPlace || '-'}</td>
                        <td>{item.recordedBy?.fullName || item.recordedBy || 'System'}</td>
                        <td>
                          <span className={`status-badge ${item.status || 'present'}`}>
                            {item.status || 'Present'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subadmins' && isMainAdmin && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Admins</p>
                  <h2>Teacher Management</h2>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateSubAdminModal(true)}>
                  + Create Teacher
                </button>
              </div>
              {searchBar('Search teachers by name, email, or username')}
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Assigned Courses</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubAdmins.map((admin) => (
                      <tr key={admin._id || admin.id}>
                        <td>{admin.fullName || 'Unknown'}</td>
                        <td>{admin.email || '-'}</td>
                        <td>{admin.username || '-'}</td>
                        <td>{admin.role || 'sub_admin'}</td>
                        <td>{(admin.assignedCourses || []).join(', ') || 'No courses assigned'}</td>
                        <td>
                          <div className="table-actions">
                            <button className="mini-btn" onClick={() => handleOpenEditSubAdmin(admin)} aria-label="Edit teacher">
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="mini-btn"
                              onClick={() => handleToggleSubAdminStatus(admin)}
                              title={admin.isActive === false ? 'Activate teacher' : 'Deactivate teacher'}
                              aria-label={admin.isActive === false ? 'Activate teacher' : 'Deactivate teacher'}
                            >
                              {admin.isActive === false ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            </button>
                            <button className="mini-btn delete-btn" onClick={() => handleDeleteSubAdmin(admin)} aria-label="Delete teacher">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'assign-students' && isMainAdmin && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Assignment</p>
                  <h2>Assign Students to Teachers</h2>
                </div>
              </div>
              {searchBar(t('searchAssign'))}
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Current Teacher</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      filteredUsers.map((student) => (
                        <tr key={student._id || student.id}>
                          <td>{student.fullName || 'Unknown'}</td>
                          <td>{student.email || '-'}</td>
                          <td>{student.course ? student.course.replace(/-/g, ' ') : '-'}</td>
                          <td>{student.assignedTeacher?.fullName || 'Unassigned'}</td>
                          <td>
                            <div className="table-actions">
                              <button className="mini-btn" onClick={() => handleOpenUser(student)} aria-label="View student details">
                                <Eye size={14} />
                              </button>
                              <button
                                className="btn-primary"
                                onClick={() => {
                                  setSelectedStudentForAssign(student);
                                  setAssignedSubAdminId(student.assignedTeacher ? String(student.assignedTeacher._id || student.assignedTeacher.id) : '');
                                  setShowAssignModal(true);
                                }}
                              >
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>
                          No approved students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && isMainAdmin && (
            <div className="content-panel">
              <div className="panel-header">
                <div><p className="eyebrow">Programme catalogue</p><h2>Course Management</h2></div>
                <button className="btn-primary" onClick={() => openCourseModal()}>+ Add Course</button>
              </div>
              <div className="course-admin-grid">
                {courses.map((course) => (
                  <article className={`admin-course-card ${course.isActive ? '' : 'archived'}`} key={course.id}>
                    <div className="course-admin-topline"><span>{course.slug}</span><span>{course.isActive ? 'Active' : 'Archived'}</span></div>
                    <h3>{course.title?.en}</h3>
                    <p>{course.title?.am}</p>
                    <div className="course-admin-actions">
                      <button className="mini-btn" onClick={() => openCourseModal(course)}><Edit2 size={14} /> Edit</button>
                      {course.isActive && <button className="mini-btn archive-btn" onClick={() => handleArchiveCourse(course)} title="Archive course"><Trash2 size={14} /> Archive</button>}
                      <button className="mini-btn permanent-delete-btn" onClick={() => handleDeleteCoursePermanently(course)} title="Permanently delete course" aria-label={`Permanently delete ${course.title?.en || course.slug}`}><Trash2 size={14} /></button>
                    </div>
                  </article>
                ))}
                {courses.length === 0 && <p className="empty-table-message">No courses found.</p>}
              </div>
            </div>
          )}
        </main>
      </div>

      {showUserModal && selectedUser && (
        <div className="modal-backdrop" onClick={() => setShowUserModal(false)}>
          <div className="modal-card wide student-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Student Details</p>
                <h3>{selectedUser.fullName || 'Student Profile'}</h3>
              </div>
              <button className="mini-btn" onClick={() => setShowUserModal(false)}>Close</button>
            </div>

            <div className="detail-sections">
              {/* Personal Information */}
              <div className="detail-section">
                <h4 className="section-title">Personal Information</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span>Full Name</span><strong>{selectedUser.fullName || '-'}</strong></div>
                  <div className="detail-item"><span>Email</span><strong>{selectedUser.email || '-'}</strong></div>
                  <div className="detail-item"><span>Phone</span><strong>{selectedUser.phone || '-'}</strong></div>
                  <div className="detail-item"><span>Age</span><strong>{selectedUser.age || '-'}</strong></div>
                  <div className="detail-item"><span>Gender</span><strong>{selectedUser.gender ? selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1) : '-'}</strong></div>
                </div>
              </div>

              {/* Course Information */}
              <div className="detail-section">
                <h4 className="section-title">Course & Level</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span>Course</span><strong>{selectedUser.course ? selectedUser.course.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '-'}</strong></div>
                  <div className="detail-item"><span>Level</span><strong>{selectedUser.level ? selectedUser.level.charAt(0).toUpperCase() + selectedUser.level.slice(1) : '-'}</strong></div>
                  <div className="detail-item"><span>Schedule</span><strong>{selectedUser.schedule ? selectedUser.schedule.charAt(0).toUpperCase() + selectedUser.schedule.slice(1) : '-'}</strong></div>
                  <div className="detail-item"><span>Live Learning Platform</span><strong>{selectedUser.learningMedia ? selectedUser.learningMedia.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '-'}</strong></div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="detail-section">
                <h4 className="section-title">Guardian Information</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span>Guardian Name</span><strong>{selectedUser.guardian || selectedUser.guardianName || '-'}</strong></div>
                  <div className="detail-item"><span>Guardian Phone</span><strong>{selectedUser.guardianPhone || selectedUser.guardian_phone || '-'}</strong></div>
                </div>
              </div>

              {/* Registration & Account Status */}
              {isMainAdmin && (
                <div className="detail-section">
                  <h4 className="section-title">Account Status</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Registration Status</span>
                      <strong>
                        <span className={`status-badge status-${selectedUser.registrationStatus || 'pending'}`}>
                          {selectedUser.registrationStatus ? selectedUser.registrationStatus.charAt(0).toUpperCase() + selectedUser.registrationStatus.slice(1) : 'Pending'}
                        </span>
                      </strong>
                    </div>
                    <div className="detail-item">
                      <span>Email Verified</span>
                      <strong>{selectedUser.isVerified ? '✓ Yes' : '✗ No'}</strong>
                    </div>
                    {selectedUser.assignedTeacher && (
                      <div className="detail-item">
                        <span>Assigned Teacher</span>
                        <strong>
                          {selectedUser.assignedTeacher.fullName
                            || selectedUser.assignedTeacher.username
                            || selectedUser.assignedTeacher.email
                            || '-'}
                        </strong>
                      </div>
                    )}
                    <div className="detail-item">
                      <span>Teaching Active</span>
                      <strong>{selectedUser.isTeachingActive ? '✓ Active' : '✗ Inactive'}</strong>
                    </div>
                </div>
              </div>

              {/* Message & Notes */}
              {selectedUser.message && (
                <div className="detail-section">
                  <h4 className="section-title">Student Message</h4>
                  <div className="message-box">
                    {selectedUser.message}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="detail-section">
                <h4 className="section-title">Timestamps</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span>Registered</span>
                    <strong>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Last Updated</span>
                    <strong>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : '-'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {isMainAdmin && (
                <select
                  value={selectedUser.registrationStatus || 'pending'}
                  onChange={(e) => handleUserStatusUpdate(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
              <button className="btn-primary" onClick={() => setShowUserModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedContact && (
        <div className="modal-backdrop" onClick={() => setShowReplyModal(false)}>
          <div className="modal-card wide message-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Message details</p>
                <h3>{selectedContact.subject || 'Contact message'}</h3>
              </div>
              <button className="mini-btn" onClick={() => setShowReplyModal(false)}>Close</button>
            </div>

            <div className="detail-grid compact">
              <div className="detail-item"><span>From</span><strong>{selectedContact.fullName || selectedContact.name || '-'}</strong></div>
              <div className="detail-item"><span>Email</span><strong>{selectedContact.email || '-'}</strong></div>
              <div className="detail-item"><span>Phone</span><strong>{selectedContact.phone || '-'}</strong></div>
              <div className="detail-item"><span>Type</span><strong>{selectedContact.type || 'inquiry'}</strong></div>
              <div className="detail-item"><span>Status</span><strong>{selectedContact.status || 'new'}</strong></div>
            </div>

            <div className="message-box">
              <span>Message</span>
              <p>{selectedContact.message || '-'}</p>
            </div>

            {(selectedContact.replyHistory?.length > 0 || selectedContact.reply) && (
              <div className="reply-history">
                <h4 className="section-title">Reply History</h4>
                {selectedContact.replyHistory?.length > 0 ? selectedContact.replyHistory.map((reply, index) => (
                  <div className="reply-history-item" key={reply._id || `${reply.repliedAt}-${index}`}>
                    <div className="reply-history-meta">
                      <strong>{reply.repliedBy?.fullName || reply.repliedBy?.email || 'Admin'}</strong>
                      <span>{reply.repliedAt ? new Date(reply.repliedAt).toLocaleString() : '-'}</span>
                    </div>
                    <p>{reply.message}</p>
                  </div>
                )) : (
                  <div className="reply-history-item">
                    <div className="reply-history-meta">
                      <strong>{selectedContact.repliedBy?.fullName || selectedContact.repliedBy?.email || 'Admin'}</strong>
                      <span>{selectedContact.repliedAt ? new Date(selectedContact.repliedAt).toLocaleString() : '-'}</span>
                    </div>
                    <p>{selectedContact.reply}</p>
                  </div>
                )}
              </div>
            )}

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply to this message..."
              className="reply-textarea"
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleMarkContactAsRead}>Mark as read</button>
              <button className="btn-secondary" onClick={handleMarkContactAsSpam}>Mark as spam</button>
              <button className="btn-primary" onClick={handleReplySubmit}>Send reply</button>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="modal-backdrop" onClick={() => setShowCourseModal(false)}>
          <div className="modal-card course-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><p className="eyebrow">Programme catalogue</p><h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3></div>
              <button className="mini-btn" type="button" onClick={() => setShowCourseModal(false)}>Close</button>
            </div>
            <form className="course-form" onSubmit={handleCourseSubmit}>
              <label>Slug<input value={courseForm.slug} onChange={(event) => setCourseForm({ ...courseForm, slug: event.target.value })} placeholder="qaida" required disabled={Boolean(editingCourse)} /></label>
              <div className="form-grid">
                <label>English title<input value={courseForm.title.en} onChange={(event) => setCourseForm({ ...courseForm, title: { ...courseForm.title, en: event.target.value } })} required /></label>
                <label>Amharic title<input value={courseForm.title.am} onChange={(event) => setCourseForm({ ...courseForm, title: { ...courseForm.title, am: event.target.value } })} required /></label>
                <label>English description<textarea value={courseForm.description.en} onChange={(event) => setCourseForm({ ...courseForm, description: { ...courseForm.description, en: event.target.value } })} required /></label>
                <label>Amharic description<textarea value={courseForm.description.am} onChange={(event) => setCourseForm({ ...courseForm, description: { ...courseForm.description, am: event.target.value } })} required /></label>
                <label>English features <span className="field-hint">One feature per line</span><textarea value={courseForm.features.en} onChange={(event) => setCourseForm({ ...courseForm, features: { ...courseForm.features, en: event.target.value } })} /></label>
                <label>Amharic features <span className="field-hint">One feature per line</span><textarea value={courseForm.features.am} onChange={(event) => setCourseForm({ ...courseForm, features: { ...courseForm.features, am: event.target.value } })} /></label>
              </div>
              <label>Display order<input type="number" min="0" value={courseForm.sortOrder} onChange={(event) => setCourseForm({ ...courseForm, sortOrder: event.target.value })} /></label>
              <label className="course-active-toggle"><input type="checkbox" checked={courseForm.isActive} onChange={(event) => setCourseForm({ ...courseForm, isActive: event.target.checked })} /> Active on public pages</label>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button><button type="submit" className="btn-primary">{editingCourse ? 'Save Changes' : 'Create Course'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showEditSubAdminModal && selectedSubAdmin && (
        <div className="modal-backdrop" onClick={() => setShowEditSubAdminModal(false)}>
          <div className="modal-card attendance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Update teacher</p>
                <h3>Edit Teacher Account</h3>
              </div>
              <button className="mini-btn" onClick={() => setShowEditSubAdminModal(false)}>Close</button>
            </div>

            <form className="subadmin-form" onSubmit={handleUpdateSubAdmin}>
              <div className="form-grid">
                <label>
                  Full name
                  <input value={editSubAdminForm.fullName} onChange={(e) => setEditSubAdminForm({ ...editSubAdminForm, fullName: e.target.value })} required />
                </label>
                <label>
                  Phone
                  <input value={editSubAdminForm.phone} onChange={(e) => setEditSubAdminForm({ ...editSubAdminForm, phone: e.target.value })} />
                </label>
                <label className="span-2">
                  New password
                  <input type="password" value={editSubAdminForm.password} onChange={(e) => setEditSubAdminForm({ ...editSubAdminForm, password: e.target.value })} placeholder="Leave blank to keep current password" />
                </label>
                <label className="span-2 toggle-label">
                  <input 
                    type="checkbox" 
                    checked={editSubAdminForm.isActive} 
                    onChange={(e) => setEditSubAdminForm({ ...editSubAdminForm, isActive: e.target.checked })}
                    className="toggle-input"
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">Active account</span>
                </label>
              </div>

              <fieldset className="course-assignment-fieldset">
                <legend>Assigned courses</legend>
                <div className="course-assignment-list">
                  {courses.filter((course) => course.isActive).map((course) => (
                    <label className="course-assignment-option" key={course.id || course._id}>
                      <input
                        type="checkbox"
                        checked={editSubAdminForm.assignedCourses.includes(course.slug)}
                        onChange={(event) => setEditSubAdminForm({
                          ...editSubAdminForm,
                          assignedCourses: event.target.checked
                            ? [...editSubAdminForm.assignedCourses, course.slug]
                            : editSubAdminForm.assignedCourses.filter((slug) => slug !== course.slug),
                        })}
                      />
                      <span><strong>{course.title?.en}</strong><small>{course.title?.am}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditSubAdminModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateSubAdminModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateSubAdminModal(false)}>
          <div className="modal-card attendance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Create manager</p>
                <h3>Create Teacher</h3>
              </div>
              <button className="mini-btn" onClick={() => setShowCreateSubAdminModal(false)}>Close</button>
            </div>

            <form className="subadmin-form" onSubmit={handleCreateSubAdmin}>
              <div className="form-grid">
                <label>
                  Full name
                  <input value={newSubAdmin.fullName} onChange={(e) => setNewSubAdmin({ ...newSubAdmin, fullName: e.target.value })} required />
                </label>
                <label>
                  Username
                  <input value={newSubAdmin.username} onChange={(e) => setNewSubAdmin({ ...newSubAdmin, username: e.target.value })} required />
                </label>
                <label>
                  Email
                  <input type="email" value={newSubAdmin.email} onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })} required />
                </label>
                <label>
                  Phone
                  <input value={newSubAdmin.phone} onChange={(e) => setNewSubAdmin({ ...newSubAdmin, phone: e.target.value })} />
                </label>
                <label className="span-2">
                  Password
                  <input type="password" value={newSubAdmin.password} onChange={(e) => setNewSubAdmin({ ...newSubAdmin, password: e.target.value })} required />
                </label>
              </div>

              <fieldset className="course-assignment-fieldset">
                <legend>Assign courses</legend>
                <p>Select at least one course this teacher can teach.</p>
                <div className="course-assignment-list">
                  {courses.filter((course) => course.isActive).map((course) => (
                    <label className="course-assignment-option" key={course.id}>
                      <input
                        type="checkbox"
                        checked={newSubAdmin.assignedCourses.includes(course.slug)}
                        onChange={(event) => setNewSubAdmin({
                          ...newSubAdmin,
                          assignedCourses: event.target.checked
                            ? [...newSubAdmin.assignedCourses, course.slug]
                            : newSubAdmin.assignedCourses.filter((slug) => slug !== course.slug),
                        })}
                      />
                      <span><strong>{course.title?.en}</strong><small>{course.title?.am}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateSubAdminModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedStudentForAssign && (
        <div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Assignment</p>
                <h3>Assign to Teacher</h3>
              </div>
              <button className="mini-btn" onClick={() => setShowAssignModal(false)}>Close</button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Student</span>
                <strong>{selectedStudentForAssign.fullName || 'Unknown'}</strong>
              </div>
              <div className="detail-item">
                <span>Email</span>
                <strong>{selectedStudentForAssign.email || '-'}</strong>
              </div>
              <div className="detail-item">
                <span>Course</span>
                <strong>{selectedStudentForAssign.course ? selectedStudentForAssign.course.replace(/-/g, ' ') : '-'}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Select Teacher
              </label>
              <select
                value={assignedSubAdminId}
                onChange={(e) => setAssignedSubAdminId(e.target.value)}
                className="status-select"
                style={{ width: '100%' }}
              >
                <option value="">-- Unassign --</option>
                {subAdmins.map((admin) => {
                  const adminId = String(admin._id || admin.id);
                  return (
                    <option key={adminId} value={adminId}>
                      {admin.fullName} ({admin.email})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleAssignStudent}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {showMarkAttendanceModal && (
        <div className="modal-backdrop" onClick={() => setShowMarkAttendanceModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Attendance</p>
                <h3>Mark Attendance</h3>
              </div>
              <button className="mini-btn" onClick={() => setShowMarkAttendanceModal(false)}>Close</button>
            </div>

            <form className="subadmin-form" onSubmit={(e) => { e.preventDefault(); handleMarkAttendance(); }}>
              <div className="form-grid">
                <label>
                  Student
                  <select 
                    value={attendanceMarking.studentId}
                    onChange={(e) => setAttendanceMarking({ ...attendanceMarking, studentId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {users.map((user) => {
                      const userId = String(user._id || user.id);
                      return (
                        <option key={userId} value={userId}>
                          {user.fullName}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label>
                  Date
                  <input 
                    type="date"
                    value={attendanceMarking.date}
                    onChange={(e) => setAttendanceMarking({ ...attendanceMarking, date: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Status
                  <select 
                    value={attendanceMarking.status}
                    onChange={(e) => setAttendanceMarking({ ...attendanceMarking, status: e.target.value })}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </label>
                <label>
                  Course
                  <input 
                    value={attendanceMarking.course}
                    onChange={(e) => setAttendanceMarking({ ...attendanceMarking, course: e.target.value })}
                  />
                </label>
                <label>
                  Started time
                  <input type="time" value={attendanceMarking.startTime} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, startTime: e.target.value })} />
                </label>
                <label>
                  Ended time
                  <input type="time" value={attendanceMarking.endTime} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, endTime: e.target.value })} />
                </label>
                <label>
                  Learning place
                  <input value={attendanceMarking.learningPlace} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, learningPlace: e.target.value })} placeholder="Online, classroom, mosque..." />
                </label>
                <label>
                  Permission
                  <select value={attendanceMarking.permissionStatus} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, permissionStatus: e.target.value })}>
                    <option value="not-required">Not required</option>
                    <option value="pending">Pending</option>
                    <option value="granted">Granted</option>
                    <option value="denied">Denied</option>
                  </select>
                </label>
                {(attendanceMarking.status === 'absent' || attendanceMarking.status === 'excused') && (
                  <>
                    <label className="span-2">
                      Absence reason
                      <input value={attendanceMarking.absenceReason} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, absenceReason: e.target.value })} required={attendanceMarking.status === 'absent'} />
                    </label>
                    <label className="span-2">
                      Permission details
                      <textarea value={attendanceMarking.permissionNote} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, permissionNote: e.target.value })} style={{ minHeight: '70px', padding: '0.8rem 0.9rem', border: '1px solid rgba(15, 31, 71, 0.2)', borderRadius: '12px', fontFamily: 'inherit' }} />
                    </label>
                  </>
                )}
                <label className="span-2">
                  Teacher suggestion
                  <textarea value={attendanceMarking.teacherSuggestion} onChange={(e) => setAttendanceMarking({ ...attendanceMarking, teacherSuggestion: e.target.value })} style={{ minHeight: '70px', padding: '0.8rem 0.9rem', border: '1px solid rgba(15, 31, 71, 0.2)', borderRadius: '12px', fontFamily: 'inherit' }} />
                </label>
                <label className="span-2">
                  Notes
                  <textarea 
                    value={attendanceMarking.notes}
                    onChange={(e) => setAttendanceMarking({ ...attendanceMarking, notes: e.target.value })}
                    style={{ minHeight: '80px', padding: '0.8rem 0.9rem', border: '1px solid rgba(15, 31, 71, 0.2)', borderRadius: '12px', fontFamily: 'inherit' }}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowMarkAttendanceModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Mark Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
