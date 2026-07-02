import { useState, useEffect, useCallback } from 'react';
import {
  Users, Mail, BarChart3, LogOut, Menu, X, Clock, CheckCircle,
  XCircle, Eye, Trash2, Send, Calendar, Filter, Search, Download,
  UserCheck, AlertCircle, Shield, ShieldCheck, UserPlus, Edit2,
  BookOpen, ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const adminInfo = apiService.getAdminInfo();
  const isMainAdmin = adminInfo?.role === 'main_admin';

  const [stats, setStats] = useState({
    totalUsers: 0, pendingRegistrations: 0, approvedRegistrations: 0,
    totalContacts: 0, newContacts: 0, monthlyAttendance: 0, totalSubAdmins: 0,
  });
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateSubAdminModal, setShowCreateSubAdminModal] = useState(false);
  const [showEditSubAdminModal, setShowEditSubAdminModal] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceCourse, setAttendanceCourse] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [attendanceFilter, setAttendanceFilter] = useState({
    startDate: '', endDate: '', course: '', status: '', teacherId: '',
  });
  const [profileForm, setProfileForm] = useState({
    fullName: adminInfo?.fullName || '',
    email: adminInfo?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Sub-admin creation form
  const [subAdminForm, setSubAdminForm] = useState({
    username: '', email: '', password: '', fullName: '', phone: '',
  });
  const [editSubAdminForm, setEditSubAdminForm] = useState({
    fullName: '', phone: '', isActive: true, password: '',
  });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsResponse = await apiService.getDashboardStats();
      setStats(statsResponse);

      if (activeTab === 'users') {
        const usersResponse = await apiService.getAllUsers();
        setUsers(Array.isArray(usersResponse) ? usersResponse : []);
        // Always load sub-admins for assignment dropdown
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
        // Also load users for attendance marking
        if (users.length === 0) {
          const usersResponse = await apiService.getAllUsers();
          setUsers(Array.isArray(usersResponse) ? usersResponse : []);
        }
        // Load sub-admins so main admin can filter by teacher
        if (isMainAdmin) {
          const saResponse = await apiService.getSubAdmins();
          setSubAdmins(Array.isArray(saResponse) ? saResponse : []);
        }
      }
      if (activeTab === 'subadmins' && isMainAdmin) {
        const saResponse = await apiService.getSubAdmins();
        setSubAdmins(Array.isArray(saResponse) ? saResponse : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showMessage(`Error loading data: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isMainAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    apiService.clearToken(true);
    navigate('/admin/login');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setSearchTerm('');
    setFilterStatus('all');
  };

  // ── User actions ───────────────────────────────────────────
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await apiService.updateUserStatus(userId, { registrationStatus: newStatus });
      showMessage(`Student ${newStatus} successfully`);
      fetchDashboardData();
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteStudent = async (userId, studentName) => {
    if (!window.confirm(`Delete "${studentName}"? This will also remove all their attendance records. This cannot be undone.`)) return;
    try {
      const res = await apiService.deleteUser(userId);
      if (res.msg) {
        showMessage(res.msg);
        fetchDashboardData();
      } else {
        showMessage(res.msg || 'Error deleting student', 'error');
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const handleToggleTeaching = async (userId, currentStatus) => {
    try {
      await apiService.updateUserStatus(userId, { isTeachingActive: !currentStatus });
      showMessage(`Teaching status updated successfully`);
      fetchDashboardData();
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters', 'error');
      return;
    }
    setProfileLoading(true);
    try {
      const payload = { fullName: profileForm.fullName, email: profileForm.email };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      const res = await apiService.updateProfile(payload);
      if (res.msg === 'Profile updated successfully') {
        showMessage('Profile updated successfully! ✓');
        setProfileForm(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showMessage(res.msg || 'Update failed', 'error');
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const user = await apiService.getUserDetails(userId);
      setSelectedUser(user);
      setShowUserModal(true);
    } catch (err) {
      showMessage('Error loading student details', 'error');
    }
  };

  const handleAssignTeacher = async (userId, teacherId) => {
    try {
      const res = await apiService.assignStudentToTeacher(userId, teacherId || null);
      if (res.msg) {
        showMessage(res.msg, 'error');
      } else {
        showMessage(teacherId ? 'Student assigned to teacher' : 'Assignment removed');
        fetchDashboardData();
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  // ── Contact actions ────────────────────────────────────────
  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await apiService.deleteContact(contactId);
      showMessage('Message deleted');
      fetchDashboardData();
    } catch (err) {
      showMessage('Error deleting message', 'error');
    }
  };

  const handleMarkAsRead = async (contactId) => {
    try {
      await apiService.markContactAsRead(contactId);
      fetchDashboardData();
    } catch (err) {
      showMessage('Error', 'error');
    }
  };

  const handleReplyContact = async () => {
    if (!replyText.trim()) { showMessage('Enter a reply', 'error'); return; }
    try {
      const res = await apiService.replyContact(selectedContact._id, replyText);
      showMessage(res && res.previewUrl ? 'Reply sent (Test Email generated)' : 'Reply sent');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedContact(null);
      fetchDashboardData();
      if (res && res.previewUrl) {
        setEmailPreviewUrl(res.previewUrl);
      }
    } catch (err) {
      showMessage('Error sending reply', 'error');
    }
  };

  // ── Attendance actions ─────────────────────────────────────
  const handleMarkAttendance = async (studentId, status) => {
    try {
      await apiService.markAttendance({
        studentId,
        course: attendanceCourse || 'General',
        date: attendanceDate,
        status,
        notes: '',
      });
      showMessage('Attendance marked');
      fetchDashboardData();
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  // ── Sub-admin actions ──────────────────────────────────────
  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.createSubAdmin(subAdminForm);
      if (res.msg && res.msg.includes('successfully')) {
        showMessage('Sub-admin created successfully');
        setShowCreateSubAdminModal(false);
        setSubAdminForm({ username: '', email: '', password: '', fullName: '', phone: '' });
        fetchDashboardData();
      } else {
        showMessage(res.msg || 'Error creating sub-admin', 'error');
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const handleEditSubAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateSubAdmin(selectedSubAdmin._id, editSubAdminForm);
      showMessage('Sub-admin updated');
      setShowEditSubAdminModal(false);
      fetchDashboardData();
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteSubAdmin = async (adminId) => {
    if (!window.confirm('Delete this sub-admin? Their students will be unassigned.')) return;
    try {
      const res = await apiService.deleteSubAdmin(adminId);
      showMessage(res.msg || 'Sub-admin deleted');
      fetchDashboardData();
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const handleToggleSubAdminStatus = async (admin) => {
    try {
      await apiService.updateSubAdmin(admin._id, { isActive: !admin.isActive });
      showMessage(`Sub-admin ${admin.isActive ? 'deactivated' : 'activated'}`);
      fetchDashboardData();
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  // ── Export helpers ─────────────────────────────────────────
  const exportToCSV = (data, filename, columns) => {
    if (!data || data.length === 0) {
      showMessage('No data to export', 'error');
      return;
    }
    const header = columns.map(c => c.label).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        const val = c.getValue(row);
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage(`${filename} exported successfully`);
  };

  const exportUsers = () => exportToCSV(filteredUsers, 'students', [
    { label: 'Full Name', getValue: r => r.fullName },
    { label: 'Email', getValue: r => r.email },
    { label: 'Phone', getValue: r => r.phone || '' },
    { label: 'Course', getValue: r => r.course || '' },
    { label: 'Level', getValue: r => r.level || '' },
    { label: 'Status', getValue: r => r.registrationStatus },
    { label: 'Assigned Teacher', getValue: r => r.assignedTeacher?.fullName || 'Unassigned' },
    { label: 'Registration Date', getValue: r => new Date(r.createdAt).toLocaleDateString() },
  ]);

  const exportAttendance = () => {
    if (isMainAdmin && !attendanceFilter.teacherId) {
      showMessage('Please select a sub-admin/teacher first to export their attendance', 'error');
      return;
    }
    const data = filteredAttendance;
    exportToCSV(data, 'attendance', [
      { label: 'Student Name', getValue: r => r.student?.fullName || '' },
      { label: 'Student Email', getValue: r => r.student?.email || '' },
      { label: 'Course', getValue: r => r.course },
      { label: 'Date', getValue: r => new Date(r.date).toLocaleDateString() },
      { label: 'Status', getValue: r => r.status },
      { label: 'Recorded By', getValue: r => r.recordedBy?.fullName || '' },
      { label: 'Notes', getValue: r => r.notes || '' },
    ]);
  };

  const exportSubAdmins = () => exportToCSV(subAdmins, 'sub_admins', [
    { label: 'Full Name', getValue: r => r.fullName },
    { label: 'Username', getValue: r => r.username },
    { label: 'Email', getValue: r => r.email },
    { label: 'Phone', getValue: r => r.phone || '' },
    { label: 'Status', getValue: r => r.isActive ? 'Active' : 'Inactive' },
    { label: 'Assigned Students', getValue: r => r.assignedStudents?.length || 0 },
    { label: 'Created', getValue: r => new Date(r.createdAt).toLocaleDateString() },
  ]);

  const exportContacts = () => exportToCSV(filteredContacts, 'messages', [
    { label: 'Name', getValue: r => r.fullName },
    { label: 'Email', getValue: r => r.email },
    { label: 'Phone', getValue: r => r.phone || '' },
    { label: 'Subject', getValue: r => r.subject },
    { label: 'Message', getValue: r => r.message },
    { label: 'Status', getValue: r => r.status },
    { label: 'Type', getValue: r => r.type },
    { label: 'Date', getValue: r => new Date(r.createdAt).toLocaleDateString() },
  ]);

  // ── Filter helpers ─────────────────────────────────────────
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.registrationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredAttendance = attendance.filter(rec => {
    if (isMainAdmin && !attendanceFilter.teacherId) {
      return false;
    }
    const matchesCourse = !attendanceFilter.course || rec.course === attendanceFilter.course;
    const matchesStatus = !attendanceFilter.status || rec.status === attendanceFilter.status;
    const matchesSearch = !searchTerm ||
      rec.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For main admin, filter by selected teacher
    const matchesTeacher = !isMainAdmin ||
      rec.recordedBy?._id === attendanceFilter.teacherId ||
      rec.recordedBy === attendanceFilter.teacherId;

    return matchesCourse && matchesStatus && matchesSearch && matchesTeacher;
  });

  // ── Sidebar nav items ──────────────────────────────────────
  const navItems = [
    { id: 'dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard', all: true },
    { id: 'users', icon: <Users size={20} />, label: isMainAdmin ? 'Students' : 'My Students', all: true },
    { id: 'attendance', icon: <Clock size={20} />, label: 'Attendance', all: true },
    { id: 'subadmins', icon: <Shield size={20} />, label: 'Sub-Admins', mainOnly: true },
    { id: 'contacts', icon: <Mail size={20} />, label: 'Messages', mainOnly: true },
    { id: 'profile', icon: <UserCheck size={20} />, label: 'My Profile', mainOnly: true },
  ].filter(item => item.all || (item.mainOnly && isMainAdmin));

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="header-brand">
              <ShieldCheck size={24} />
              <span>Nida Al-Quran Admin</span>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-badge">
              <div className="admin-avatar">{adminInfo?.fullName?.charAt(0) || 'A'}</div>
              <div className="admin-info">
                <span className="admin-name">{adminInfo?.fullName || 'Admin'}</span>
                <span className={`admin-role-tag ${isMainAdmin ? 'main' : 'sub'}`}>
                  {isMainAdmin ? 'Main Admin' : 'Sub Admin'}
                </span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast alert */}
      {message.text && (
        <div className={`toast-alert toast-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <span>Navigation</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => switchTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'contacts' && stats.newContacts > 0 && (
                  <span className="nav-badge">{stats.newContacts}</span>
                )}
                {item.id === 'users' && stats.pendingRegistrations > 0 && isMainAdmin && (
                  <span className="nav-badge">{stats.pendingRegistrations}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="btn-logout-sidebar" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">

          {/* ── DASHBOARD TAB ────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <section className="dashboard-section">
              <div className="page-title">
                <h2>Dashboard Overview</h2>
                <p>{isMainAdmin ? 'Full system statistics' : 'Your assigned students overview'}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card blue" onClick={() => switchTab('users')}>
                  <div className="stat-icon-wrap"><Users size={28} /></div>
                  <div className="stat-body">
                    <p className="stat-number">{stats.totalUsers}</p>
                    <h3>{isMainAdmin ? 'Total Students' : 'My Students'}</h3>
                    <span className="stat-label">Registered</span>
                  </div>
                </div>

                {isMainAdmin && (
                  <div className="stat-card gold" onClick={() => { switchTab('users'); setFilterStatus('pending'); }}>
                    <div className="stat-icon-wrap"><Clock size={28} /></div>
                    <div className="stat-body">
                      <p className="stat-number">{stats.pendingRegistrations}</p>
                      <h3>Pending</h3>
                      <span className="stat-label">Awaiting Approval</span>
                    </div>
                  </div>
                )}

                <div className="stat-card green" onClick={() => { switchTab('users'); setFilterStatus('approved'); }}>
                  <div className="stat-icon-wrap"><CheckCircle size={28} /></div>
                  <div className="stat-body">
                    <p className="stat-number">{stats.approvedRegistrations}</p>
                    <h3>Approved</h3>
                    <span className="stat-label">Active Students</span>
                  </div>
                </div>

                <div className="stat-card navy" onClick={() => switchTab('attendance')}>
                  <div className="stat-icon-wrap"><Calendar size={28} /></div>
                  <div className="stat-body">
                    <p className="stat-number">{stats.monthlyAttendance}</p>
                    <h3>This Month</h3>
                    <span className="stat-label">Attendance Records</span>
                  </div>
                </div>

                {isMainAdmin && (
                  <>
                    <div className="stat-card teal" onClick={() => switchTab('contacts')}>
                      <div className="stat-icon-wrap"><Mail size={28} /></div>
                      <div className="stat-body">
                        <p className="stat-number">{stats.newContacts}</p>
                        <h3>New Messages</h3>
                        <span className="stat-label">Unread</span>
                      </div>
                    </div>
                    <div className="stat-card purple" onClick={() => switchTab('subadmins')}>
                      <div className="stat-icon-wrap"><Shield size={28} /></div>
                      <div className="stat-body">
                        <p className="stat-number">{stats.totalSubAdmins}</p>
                        <h3>Sub Admins</h3>
                        <span className="stat-label">Teachers</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="activity-panel">
                <h3>Quick Summary</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon gold"><UserCheck size={18} /></div>
                    <div>
                      <strong>{stats.approvedRegistrations}</strong> active student(s)
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon blue"><Calendar size={18} /></div>
                    <div>
                      <strong>{stats.monthlyAttendance}</strong> attendance record(s) this month
                    </div>
                  </div>
                  {isMainAdmin && (
                    <>
                      <div className="activity-item">
                        <div className="activity-icon orange"><Clock size={18} /></div>
                        <div>
                          <strong>{stats.pendingRegistrations}</strong> registration(s) pending approval
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon teal"><Mail size={18} /></div>
                        <div>
                          <strong>{stats.newContacts}</strong> unread message(s)
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── USERS / STUDENTS TAB ─────────────────────────── */}
          {activeTab === 'users' && (
            <section className="section-content">
              <div className="section-header">
                <div>
                  <h2>{isMainAdmin ? 'Manage Students' : 'My Students'}</h2>
                  <p>{isMainAdmin ? 'View and manage all registered students' : 'Students assigned to you'}</p>
                </div>
                <div className="section-actions">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {isMainAdmin && (
                    <div className="filter-box">
                      <Filter size={16} />
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                  <button className="btn-export" onClick={exportUsers}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-ring" />
                  <p>Loading students...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <Users size={56} />
                  <p>No students found</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Level</th>
                        {isMainAdmin && <th>Assigned Teacher</th>}
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{user.fullName?.charAt(0)}</div>
                              <div>
                                <div className="user-name">{user.fullName}</div>
                                <div className="user-meta">{user.phone || user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="td-email">{user.email}</td>
                          <td>{user.course || '—'}</td>
                          <td>
                            <span className="level-badge">{user.level || '—'}</span>
                          </td>
                          {isMainAdmin && (
                            <td>
                              {user.registrationStatus === 'rejected' ? (
                                <span className="assign-blocked" title="Cannot assign rejected students">
                                  Rejected — N/A
                                </span>
                              ) : (
                                <div className="teacher-assign">
                                  <select
                                    value={user.assignedTeacher?._id || ''}
                                    onChange={e => handleAssignTeacher(user._id, e.target.value)}
                                    className="teacher-select"
                                  >
                                    <option value="">Unassigned</option>
                                    {subAdmins.filter(sa => sa.isActive).map(sa => (
                                      <option key={sa._id} value={sa._id}>{sa.fullName}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={14} className="select-chevron" />
                                </div>
                              )}
                            </td>
                          )}
                          <td>
                            <span className={`status-badge ${user.registrationStatus}`}>
                              {user.registrationStatus}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              {isMainAdmin && user.registrationStatus === 'pending' && (
                                <>
                                  <button
                                    className="btn-icon success"
                                    title="Approve"
                                    onClick={() => handleUpdateUserStatus(user._id, 'approved')}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="btn-icon danger"
                                    title="Reject"
                                    onClick={() => handleUpdateUserStatus(user._id, 'rejected')}
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              <button
                                className="btn-icon primary"
                                title="View Details"
                                onClick={() => handleViewUser(user._id)}
                              >
                                <Eye size={16} />
                              </button>
                              {isMainAdmin && (
                                <button
                                  className="btn-icon danger"
                                  title="Delete Student"
                                  onClick={() => handleDeleteStudent(user._id, user.fullName)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer-bar">
                    Showing {filteredUsers.length} of {users.length} students
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── ATTENDANCE TAB ───────────────────────────────── */}
          {activeTab === 'attendance' && (
            <section className="section-content">
              <div className="section-header">
                <div>
                  <h2>Attendance Management</h2>
                  <p>{isMainAdmin ? 'All student attendance records' : 'Mark attendance for your students'}</p>
                </div>
                <div className="section-actions">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="btn-export" onClick={exportAttendance}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Mark Attendance Section (Sub-admin only) or Control Teaching Assignments (Main Admin only) */}
              {!isMainAdmin ? (
                <div className="attendance-mark-panel">
                  <h3><BookOpen size={18} /> Mark Attendance</h3>
                  <div className="attendance-controls">
                    <div className="control-group">
                      <label>Date</label>
                      <div className="input-with-icon">
                        <Calendar size={16} />
                        <input
                          type="date"
                          value={attendanceDate}
                          onChange={e => setAttendanceDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="control-group">
                      <label>Course</label>
                      <select
                        value={attendanceCourse}
                        onChange={e => setAttendanceCourse(e.target.value)}
                      >
                        <option value="">All Courses</option>
                        <option value="quran-recitation">Quran Recitation</option>
                        <option value="quran-memorization">Quran Memorization</option>
                        <option value="islamic-studies">Islamic Studies</option>
                        <option value="arabic-language">Arabic Language</option>
                      </select>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="loading-state"><div className="loading-ring" /><p>Loading...</p></div>
                  ) : users.filter(u => u.registrationStatus === 'approved').length === 0 ? (
                    <div className="empty-state">
                      <Clock size={48} />
                      <p>No approved students to mark attendance</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ marginTop: '1rem' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Mark Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(u => u.registrationStatus === 'approved')
                            .filter(u => !attendanceCourse || u.course === attendanceCourse)
                            .map(user => (
                              <tr key={user._id}>
                                <td>
                                  <div className="user-cell">
                                    <div className="user-avatar">{user.fullName?.charAt(0)}</div>
                                    <span>{user.fullName}</span>
                                  </div>
                                </td>
                                <td>{user.course || '—'}</td>
                                <td>
                                  <div className="attendance-btns">
                                    {['present', 'absent', 'late', 'excused'].map(s => (
                                      <button
                                        key={s}
                                        className={`btn-attendance ${s}`}
                                        onClick={() => handleMarkAttendance(user._id, s)}
                                      >
                                        {s === 'present' && <CheckCircle size={14} />}
                                        {s === 'absent' && <XCircle size={14} />}
                                        {s === 'late' && <Clock size={14} />}
                                        {s === 'excused' && <AlertCircle size={14} />}
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="attendance-mark-panel">
                  <h3><Shield size={18} /> Control Teaching Assignments</h3>
                  <p className="panel-desc" style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '1.25rem' }}>
                    Control which teachers (sub-admins) actively teach students. If a student is set to "Teaching Blocked", the teacher will not see that student on their dashboard and cannot take their attendance.
                  </p>
                  
                  <div className="attendance-controls">
                    <div className="control-group">
                      <label>Course Filter</label>
                      <select
                        value={attendanceCourse}
                        onChange={e => setAttendanceCourse(e.target.value)}
                      >
                        <option value="">All Courses</option>
                        <option value="quran-recitation">Quran Recitation</option>
                        <option value="quran-memorization">Quran Memorization</option>
                        <option value="islamic-studies">Islamic Studies</option>
                        <option value="arabic-language">Arabic Language</option>
                      </select>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="loading-state"><div className="loading-ring" /><p>Loading...</p></div>
                  ) : users.filter(u => u.registrationStatus === 'approved').length === 0 ? (
                    <div className="empty-state">
                      <Users size={48} />
                      <p>No approved students registered yet</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ marginTop: '1rem' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Assigned Teacher</th>
                            <th>Teaching Active Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(u => u.registrationStatus === 'approved')
                            .filter(u => !attendanceCourse || u.course === attendanceCourse)
                            .map(user => (
                              <tr key={user._id}>
                                <td>
                                  <div className="user-cell">
                                    <div className="user-avatar">{user.fullName?.charAt(0)}</div>
                                    <div>
                                      <div className="user-name">{user.fullName}</div>
                                      <div className="user-meta">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>{user.course || '—'}</td>
                                <td>
                                  <div className="teacher-assign">
                                    <select
                                      value={user.assignedTeacher?._id || ''}
                                      onChange={e => handleAssignTeacher(user._id, e.target.value)}
                                      className="teacher-select"
                                    >
                                      <option value="">Unassigned</option>
                                      {subAdmins.filter(sa => sa.isActive).map(sa => (
                                        <option key={sa._id} value={sa._id}>{sa.fullName}</option>
                                      ))}
                                    </select>
                                    <ChevronDown size={14} className="select-chevron" />
                                  </div>
                                </td>
                                <td>
                                  <button
                                    className={`btn-teaching-toggle ${user.isTeachingActive !== false ? 'active' : 'inactive'}`}
                                    onClick={() => handleToggleTeaching(user._id, user.isTeachingActive !== false)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      padding: '0.4rem 0.8rem',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'var(--admin-transition)',
                                      color: user.isTeachingActive !== false ? '#065f46' : '#991b1b',
                                      background: user.isTeachingActive !== false ? '#d1fae5' : '#fee2e2',
                                    }}
                                  >
                                    {user.isTeachingActive !== false ? (
                                      <>
                                        <CheckCircle size={14} />
                                        <span>Active Teaching</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle size={14} />
                                        <span>Teaching Blocked</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Attendance Records */}
              <div className="attendance-records-panel">
                <div className="records-header">
                  <h3>Attendance Records</h3>
                  <div className="records-filters">
                    <select
                      value={attendanceFilter.course}
                      onChange={e => setAttendanceFilter(p => ({ ...p, course: e.target.value }))}
                    >
                      <option value="">All Courses</option>
                      <option value="quran-recitation">Quran Recitation</option>
                      <option value="quran-memorization">Quran Memorization</option>
                      <option value="islamic-studies">Islamic Studies</option>
                      <option value="arabic-language">Arabic Language</option>
                    </select>
                    <select
                      value={attendanceFilter.status}
                      onChange={e => setAttendanceFilter(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                    {isMainAdmin && (
                      <select
                        value={attendanceFilter.teacherId}
                        onChange={e => setAttendanceFilter(p => ({ ...p, teacherId: e.target.value }))}
                      >
                        <option value="">Select Sub-Admin / Teacher...</option>
                        {subAdmins.map(sa => (
                          <option key={sa._id} value={sa._id}>{sa.fullName}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                {isMainAdmin && !attendanceFilter.teacherId ? (
                  <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                    <Users size={48} />
                    <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: '500' }}>
                      Please select a sub-admin/teacher from the dropdown to view their recorded attendance records.
                    </p>
                  </div>
                ) : filteredAttendance.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <Clock size={40} />
                    <p>No attendance records found</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Course</th>
                          <th>Date</th>
                          <th>Status</th>
                          {isMainAdmin && <th>Recorded By</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendance.map(rec => (
                          <tr key={rec._id}>
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar">{rec.student?.fullName?.charAt(0)}</div>
                                <span>{rec.student?.fullName || '—'}</span>
                              </div>
                            </td>
                            <td>{rec.course}</td>
                            <td>{new Date(rec.date).toLocaleDateString()}</td>
                            <td>
                              <span className={`attendance-badge ${rec.status}`}>{rec.status}</span>
                            </td>
                            {isMainAdmin && (
                              <td className="td-email">{rec.recordedBy?.fullName || '—'}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="table-footer-bar">
                      {filteredAttendance.length} record(s)
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── SUB-ADMINS TAB (Main Admin only) ─────────────── */}
          {activeTab === 'subadmins' && isMainAdmin && (
            <section className="section-content">
              <div className="section-header">
                <div>
                  <h2>Sub-Admin Management</h2>
                  <p>Create and manage teachers / sub-admins</p>
                </div>
                <div className="section-actions">
                  <button
                    className="btn-primary-action"
                    onClick={() => setShowCreateSubAdminModal(true)}
                  >
                    <UserPlus size={16} /> Create Sub-Admin
                  </button>
                  <button className="btn-export" onClick={exportSubAdmins}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-state"><div className="loading-ring" /><p>Loading...</p></div>
              ) : subAdmins.length === 0 ? (
                <div className="empty-state">
                  <Shield size={56} />
                  <p>No sub-admins created yet</p>
                  <button className="btn-primary-action mt-1" onClick={() => setShowCreateSubAdminModal(true)}>
                    <UserPlus size={16} /> Create First Sub-Admin
                  </button>
                </div>
              ) : (
                <div className="subadmin-grid">
                  {subAdmins.map(sa => (
                    <div key={sa._id} className={`subadmin-card ${sa.isActive ? '' : 'inactive'}`}>
                      <div className="subadmin-card-top">
                        <div className="sa-avatar">{sa.fullName?.charAt(0)}</div>
                        <div>
                          <h4>{sa.fullName}</h4>
                          <p className="sa-username">@{sa.username}</p>
                        </div>
                        <span className={`status-pill ${sa.isActive ? 'active' : 'inactive'}`}>
                          {sa.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="subadmin-card-info">
                        <div className="info-row"><Mail size={14} /><span>{sa.email}</span></div>
                        {sa.phone && <div className="info-row"><span>📞</span><span>{sa.phone}</span></div>}
                        <div className="info-row">
                          <Users size={14} />
                          <span>{sa.assignedStudents?.length || 0} student(s) assigned</span>
                        </div>
                        <div className="info-row">
                          <Calendar size={14} />
                          <span>Since {new Date(sa.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {sa.assignedStudents?.length > 0 && (
                        <div className="sa-students-preview">
                          <p className="preview-label">Assigned Students:</p>
                          <div className="student-tags">
                            {sa.assignedStudents.slice(0, 3).map(s => (
                              <span key={s._id} className="student-tag">{s.fullName}</span>
                            ))}
                            {sa.assignedStudents.length > 3 && (
                              <span className="student-tag more">+{sa.assignedStudents.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="subadmin-card-actions">
                        <button
                          className="btn-icon primary"
                          title="Edit"
                          onClick={() => {
                            setSelectedSubAdmin(sa);
                            setEditSubAdminForm({ fullName: sa.fullName, phone: sa.phone || '', isActive: sa.isActive, password: '' });
                            setShowEditSubAdminModal(true);
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className={`btn-icon ${sa.isActive ? 'warning' : 'success'}`}
                          title={sa.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleSubAdminStatus(sa)}
                        >
                          {sa.isActive ? <XCircle size={15} /> : <CheckCircle size={15} />}
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => handleDeleteSubAdmin(sa._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── CONTACTS TAB (Main Admin only) ───────────────── */}
          {activeTab === 'contacts' && isMainAdmin && (
            <section className="section-content">
              <div className="section-header">
                <div>
                  <h2>Contact Messages</h2>
                  <p>Manage enquiries and messages from visitors</p>
                </div>
                <div className="section-actions">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-box">
                    <Filter size={16} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <button className="btn-export" onClick={exportContacts}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-state"><div className="loading-ring" /><p>Loading...</p></div>
              ) : filteredContacts.length === 0 ? (
                <div className="empty-state"><Mail size={56} /><p>No messages found</p></div>
              ) : (
                <div className="contacts-grid">
                  {filteredContacts.map(contact => (
                    <div key={contact._id} className={`contact-card ${contact.status}`}>
                      <div className="contact-card-header">
                        <div>
                          <h4>{contact.subject}</h4>
                          <div className="contact-badges">
                            <span className={`status-badge ${contact.status}`}>{contact.status}</span>
                            {contact.type && <span className="type-badge">{contact.type}</span>}
                          </div>
                        </div>
                        <div className="contact-date">{new Date(contact.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="contact-info">
                        <p><strong>From:</strong> {contact.fullName}</p>
                        <p><strong>Email:</strong> {contact.email}</p>
                        {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                      </div>
                      <div className="contact-message">{contact.message}</div>
                      {contact.reply && (
                        <div className="contact-reply">
                          <strong>Reply:</strong>
                          <p>{contact.reply}</p>
                          <small>Replied on {new Date(contact.repliedAt).toLocaleString()}</small>
                        </div>
                      )}
                      <div className="contact-actions">
                        {contact.status === 'new' && (
                          <button className="btn-small primary" onClick={() => handleMarkAsRead(contact._id)}>
                            Mark Read
                          </button>
                        )}
                        {contact.status !== 'replied' && (
                          <button className="btn-small success" onClick={() => { setSelectedContact(contact); setShowReplyModal(true); }}>
                            <Send size={14} /> Reply
                          </button>
                        )}
                        <button className="btn-small danger" onClick={() => handleDeleteContact(contact._id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── PROFILE TAB (Main Admin only) ─────────────── */}
          {activeTab === 'profile' && isMainAdmin && (
            <section className="section-content">
              <div className="section-header">
                <div>
                  <h2>My Profile</h2>
                  <p>Update your account name, email and password</p>
                </div>
              </div>

              <div className="profile-settings-grid">
                {/* Account Info Card */}
                <div className="profile-card">
                  <div className="profile-avatar-block">
                    <div className="profile-avatar-lg">
                      {(profileForm.fullName || adminInfo?.fullName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="profile-name">{profileForm.fullName || adminInfo?.fullName}</div>
                      <div className="profile-role-badge">Main Administrator</div>
                    </div>
                  </div>
                </div>

                {/* Edit Form Card */}
                <div className="profile-card profile-form-card">
                  <form onSubmit={handleUpdateProfile} className="profile-form">
                    <h3 className="form-section-title">Account Information</h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <h3 className="form-section-title" style={{ marginTop: '1.5rem' }}>Change Password</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>
                      Leave blank to keep your current password.
                    </p>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={profileForm.currentPassword}
                          onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="form-group" />
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={profileForm.newPassword}
                          onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Min. 6 characters"
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={profileForm.confirmPassword}
                          onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '1.75rem' }}>
                      <button
                        type="submit"
                        className="btn-primary-action"
                        disabled={profileLoading}
                        style={{ minWidth: '160px' }}
                      >
                        {profileLoading ? (
                          <><div className="loading-ring" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
                        ) : (
                          <><CheckCircle size={16} /> Save Changes</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {[
                  ['Full Name', selectedUser.fullName],
                  ['Email', selectedUser.email],
                  ['Phone', selectedUser.phone || '—'],
                  ['Age', selectedUser.age || '—'],
                  ['Gender', selectedUser.gender || '—'],
                  ['Course', selectedUser.course || '—'],
                  ['Level', selectedUser.level || '—'],
                  ['Schedule', selectedUser.schedule || '—'],
                  ['Status', selectedUser.registrationStatus],
                  ['Registered', new Date(selectedUser.createdAt).toLocaleDateString()],
                  ['Assigned Teacher', selectedUser.assignedTeacher?.fullName || 'Unassigned'],
                ].map(([label, value]) => (
                  <div key={label} className="detail-item">
                    <label>{label}</label>
                    <span className={label === 'Status' ? `status-badge ${value}` : ''}>{value}</span>
                  </div>
                ))}
                {selectedUser.guardian && (
                  <>
                    <div className="detail-item"><label>Guardian</label><span>{selectedUser.guardian}</span></div>
                    <div className="detail-item"><label>Guardian Phone</label><span>{selectedUser.guardianPhone}</span></div>
                  </>
                )}
                {selectedUser.message && (
                  <div className="detail-item full-width">
                    <label>Message</label>
                    <p>{selectedUser.message}</p>
                  </div>
                )}
              </div>
            </div>
            {isMainAdmin && selectedUser.registrationStatus === 'pending' && (
              <div className="modal-footer">
                <button className="btn-modal success" onClick={() => { handleUpdateUserStatus(selectedUser._id, 'approved'); setShowUserModal(false); }}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button className="btn-modal danger" onClick={() => { handleUpdateUserStatus(selectedUser._id, 'rejected'); setShowUserModal(false); }}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reply Contact Modal */}
      {showReplyModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply to Message</h3>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="reply-info">
                <p><strong>To:</strong> {selectedContact.fullName} ({selectedContact.email})</p>
                <p><strong>Subject:</strong> {selectedContact.subject}</p>
                <div className="original-msg"><strong>Original:</strong><p>{selectedContact.message}</p></div>
              </div>
              <div className="form-group">
                <label>Your Reply</label>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal success" onClick={handleReplyContact}>
                <Send size={16} /> Send Reply
              </button>
              <button className="btn-modal secondary" onClick={() => setShowReplyModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {emailPreviewUrl && (
        <div className="modal-overlay" onClick={() => setEmailPreviewUrl('')}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Test Email Generated</h3>
              <button className="modal-close" onClick={() => setEmailPreviewUrl('')}><X size={20} /></button>
            </div>
            <div className="modal-body text-center" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div className="email-success-icon" style={{ color: '#D4AF37', marginBottom: '1.5rem' }}>
                <Mail size={48} style={{ margin: '0 auto' }} />
              </div>
              <h4 style={{ color: 'var(--admin-dark-navy)', fontWeight: '700', marginBottom: '0.75rem', fontSize: '1.15rem' }}>Ethereal Test Email Inbox Used</h4>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                Since SMTP credentials are not configured in the application environment, the email was sent using a simulated Ethereal test inbox. You can inspect the email exactly as the user would see it in their inbox by clicking the button below:
              </p>
              <a
                href={emailPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modal success"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#D4AF37',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: '600',
                  margin: '0 auto',
                  transition: 'background-color 0.2s'
                }}
              >
                <Eye size={16} /> View Sent Email Preview
              </a>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-modal secondary" onClick={() => setEmailPreviewUrl('')}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub-Admin Modal */}
      {showCreateSubAdminModal && (
        <div className="modal-overlay" onClick={() => setShowCreateSubAdminModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Sub-Admin</h3>
              <button className="modal-close" onClick={() => setShowCreateSubAdminModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSubAdmin}>
              <div className="modal-body">
                <div className="form-grid">
                  {[
                    ['fullName', 'Full Name', 'text', 'e.g. Ahmad Hassan'],
                    ['username', 'Username', 'text', 'e.g. teacher1'],
                    ['email', 'Email', 'email', 'teacher@nida.com'],
                    ['phone', 'Phone', 'text', '+966...'],
                    ['password', 'Password', 'password', 'Min 6 characters'],
                  ].map(([field, label, type, placeholder]) => (
                    <div key={field} className="form-group">
                      <label>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={subAdminForm[field]}
                        onChange={e => setSubAdminForm(p => ({ ...p, [field]: e.target.value }))}
                        required={field !== 'phone'}
                        minLength={field === 'password' ? 6 : undefined}
                      />
                    </div>
                  ))}
                </div>
                <div className="info-note">
                  <Shield size={14} />
                  Sub-admins can mark attendance for their assigned students and view basic stats.
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal success">
                  <UserPlus size={16} /> Create Sub-Admin
                </button>
                <button type="button" className="btn-modal secondary" onClick={() => setShowCreateSubAdminModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sub-Admin Modal */}
      {showEditSubAdminModal && selectedSubAdmin && (
        <div className="modal-overlay" onClick={() => setShowEditSubAdminModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Sub-Admin — {selectedSubAdmin.fullName}</h3>
              <button className="modal-close" onClick={() => setShowEditSubAdminModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubAdmin}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editSubAdminForm.fullName}
                      onChange={e => setEditSubAdminForm(p => ({ ...p, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={editSubAdminForm.phone}
                      onChange={e => setEditSubAdminForm(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (leave blank to keep)</label>
                    <input
                      type="password"
                      placeholder="New password..."
                      value={editSubAdminForm.password}
                      onChange={e => setEditSubAdminForm(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={editSubAdminForm.isActive}
                      onChange={e => setEditSubAdminForm(p => ({ ...p, isActive: e.target.value === 'true' }))}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal success">
                  <CheckCircle size={16} /> Save Changes
                </button>
                <button type="button" className="btn-modal secondary" onClick={() => setShowEditSubAdminModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
