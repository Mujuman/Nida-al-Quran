import { useState, useEffect } from 'react';
import { Users, Mail, BarChart3, LogOut, Menu, X, Clock, CheckCircle, XCircle, Eye, Trash2, Send, Calendar, Filter, Search, Download, UserCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
    totalContacts: 0,
    newContacts: 0,
    monthlyAttendance: 0,
  });
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceCourse, setAttendanceCourse] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsResponse = await apiService.getDashboardStats();
      setStats(statsResponse);

      if (activeTab === 'users') {
        const usersResponse = await apiService.getAllUsers();
        setUsers(usersResponse);
      }

      if (activeTab === 'contacts') {
        const contactsResponse = await apiService.getAllContacts();
        setContacts(contactsResponse);
      }

      if (activeTab === 'attendance') {
        const attendanceResponse = await apiService.getAllAttendance();
        setAttendance(attendanceResponse);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showMessage('Error loading data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.clearToken(true);
    navigate('/admin/login');
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await apiService.updateUserStatus(userId, {
        registrationStatus: newStatus
      });
      showMessage(`User ${newStatus} successfully`, 'success');
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating user status:', err);
      showMessage('Error updating user status', 'error');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const user = await apiService.getUserDetails(userId);
      setSelectedUser(user);
      setShowUserModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      showMessage('Error loading user details', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await apiService.deleteContact(contactId);
      showMessage('Message deleted successfully', 'success');
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting contact:', err);
      showMessage('Error deleting message', 'error');
    }
  };

  const handleMarkAsRead = async (contactId) => {
    try {
      await apiService.markContactAsRead(contactId);
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleReplyContact = async () => {
    if (!replyText.trim()) {
      showMessage('Please enter a reply', 'error');
      return;
    }

    try {
      await apiService.replyContact(selectedContact._id, replyText);
      showMessage('Reply sent successfully', 'success');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedContact(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Error sending reply:', err);
      showMessage('Error sending reply', 'error');
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await apiService.markAttendance({
        studentId,
        course: attendanceCourse || 'General',
        date: attendanceDate,
        status,
        notes: ''
      });
      showMessage('Attendance marked successfully', 'success');
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking attendance:', err);
      showMessage('Error marking attendance', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.registrationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>Nida Al-Quran - Admin Panel</h1>
          <div className="header-actions">
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('users');
                setSidebarOpen(false);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <Users size={20} />
              <span>Manage Users</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('contacts');
                setSidebarOpen(false);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <Mail size={20} />
              <span>Messages</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('attendance');
                setSidebarOpen(false);
              }}
            >
              <Clock size={20} />
              <span>Attendance</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <section className="dashboard-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card" onClick={() => setActiveTab('users')}>
                  <div className="stat-icon"><Users size={32} /></div>
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                  <span className="stat-label">Registered Students</span>
                </div>
                <div className="stat-card pending" onClick={() => { setActiveTab('users'); setFilterStatus('pending'); }}>
                  <div className="stat-icon"><Clock size={32} /></div>
                  <h3>Pending</h3>
                  <p className="stat-number">{stats.pendingRegistrations}</p>
                  <span className="stat-label">Awaiting Approval</span>
                </div>
                <div className="stat-card approved" onClick={() => { setActiveTab('users'); setFilterStatus('approved'); }}>
                  <div className="stat-icon"><CheckCircle size={32} /></div>
                  <h3>Approved</h3>
                  <p className="stat-number">{stats.approvedRegistrations}</p>
                  <span className="stat-label">Active Students</span>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('contacts')}>
                  <div className="stat-icon"><Mail size={32} /></div>
                  <h3>Total Messages</h3>
                  <p className="stat-number">{stats.totalContacts}</p>
                  <span className="stat-label">Contact Submissions</span>
                </div>
                <div className="stat-card warning" onClick={() => { setActiveTab('contacts'); setFilterStatus('new'); }}>
                  <div className="stat-icon"><AlertCircle size={32} /></div>
                  <h3>New Messages</h3>
                  <p className="stat-number">{stats.newContacts}</p>
                  <span className="stat-label">Unread</span>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('attendance')}>
                  <div className="stat-icon"><Calendar size={32} /></div>
                  <h3>This Month</h3>
                  <p className="stat-number">{stats.monthlyAttendance}</p>
                  <span className="stat-label">Attendance Records</span>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <UserCheck size={20} />
                    <span>{stats.pendingRegistrations} new registration(s) pending approval</span>
                  </div>
                  <div className="activity-item">
                    <Mail size={20} />
                    <span>{stats.newContacts} unread message(s)</span>
                  </div>
                  <div className="activity-item">
                    <Clock size={20} />
                    <span>{stats.monthlyAttendance} attendance record(s) this month</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section className="users-section">
              <div className="section-header">
                <h2>Manage Users</h2>
                <div className="section-actions">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-box">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <button className="btn-export">
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-spinner">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Course</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">{user.fullName.charAt(0)}</div>
                              <div>
                                <div className="user-name">{user.fullName}</div>
                                <div className="user-age">{user.age} years, {user.gender}</div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.phone || '-'}</td>
                          <td>{user.course || '-'}</td>
                          <td>
                            <span className="level-badge">{user.level || '-'}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.registrationStatus}`}>
                              {user.registrationStatus}
                            </span>
                          </td>
                          <td className="actions">
                            {user.registrationStatus === 'pending' && (
                              <>
                                <button
                                  className="btn-icon success"
                                  title="Approve"
                                  onClick={() => handleUpdateUserStatus(user._id, 'approved')}
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  className="btn-icon danger"
                                  title="Reject"
                                  onClick={() => handleUpdateUserStatus(user._id, 'rejected')}
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button
                              className="btn-icon primary"
                              title="View Details"
                              onClick={() => handleViewUser(user._id)}
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    <span>Showing {filteredUsers.length} of {users.length} users</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <section className="contacts-section">
              <div className="section-header">
                <h2>Contact Messages</h2>
                <div className="section-actions">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-box">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-spinner">Loading messages...</div>
              ) : filteredContacts.length === 0 ? (
                <div className="empty-state">
                  <Mail size={48} />
                  <p>No messages found</p>
                </div>
              ) : (
                <div className="contacts-grid">
                  {filteredContacts.map(contact => (
                    <div key={contact._id} className={`contact-card ${contact.status}`}>
                      <div className="contact-card-header">
                        <div>
                          <h4>{contact.subject}</h4>
                          <span className={`status-badge ${contact.status}`}>
                            {contact.status}
                          </span>
                          <span className={`type-badge ${contact.type}`}>
                            {contact.type}
                          </span>
                        </div>
                        <div className="contact-date">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="contact-info">
                        <p><strong>From:</strong> {contact.fullName}</p>
                        <p><strong>Email:</strong> {contact.email}</p>
                        {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                      </div>
                      
                      <div className="contact-message">
                        <p>{contact.message}</p>
                      </div>

                      {contact.reply && (
                        <div className="contact-reply">
                          <strong>Reply:</strong>
                          <p>{contact.reply}</p>
                          <small>Replied on {new Date(contact.repliedAt).toLocaleString()}</small>
                        </div>
                      )}
                      
                      <div className="contact-actions">
                        {contact.status === 'new' && (
                          <button 
                            className="btn-small primary"
                            onClick={() => handleMarkAsRead(contact._id)}
                          >
                            Mark Read
                          </button>
                        )}
                        {contact.status !== 'replied' && (
                          <button 
                            className="btn-small success"
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowReplyModal(true);
                            }}
                          >
                            <Send size={16} />
                            Reply
                          </button>
                        )}
                        <button 
                          className="btn-small danger"
                          onClick={() => handleDeleteContact(contact._id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <section className="attendance-section">
              <div className="section-header">
                <h2>Attendance Management</h2>
                <div className="section-actions">
                  <div className="date-picker">
                    <Calendar size={18} />
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                  <select 
                    value={attendanceCourse} 
                    onChange={(e) => setAttendanceCourse(e.target.value)}
                    className="course-select"
                  >
                    <option value="">All Courses</option>
                    <option value="quran-recitation">Quran Recitation</option>
                    <option value="quran-memorization">Quran Memorization</option>
                    <option value="islamic-studies">Islamic Studies</option>
                    <option value="arabic-language">Arabic Language</option>
                  </select>
                  <button className="btn-export">
                    <Download size={18} />
                    Export Report
                  </button>
                </div>
              </div>

              <div className="attendance-content">
                {users.filter(u => u.registrationStatus === 'approved').length === 0 ? (
                  <div className="empty-state">
                    <Clock size={48} />
                    <p>No approved students to mark attendance</p>
                  </div>
                ) : (
                  <div className="attendance-list">
                    <h3>Mark Attendance for {new Date(attendanceDate).toLocaleDateString()}</h3>
                    <div className="attendance-table-container">
                      <table className="attendance-table">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Email</th>
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
                                <div className="user-info">
                                  <div className="user-avatar">{user.fullName.charAt(0)}</div>
                                  <span>{user.fullName}</span>
                                </div>
                              </td>
                              <td>{user.course || '-'}</td>
                              <td>{user.email}</td>
                              <td className="attendance-actions">
                                <button 
                                  className="btn-attendance present"
                                  onClick={() => handleMarkAttendance(user._id, 'present')}
                                  title="Present"
                                >
                                  <CheckCircle size={16} />
                                  Present
                                </button>
                                <button 
                                  className="btn-attendance absent"
                                  onClick={() => handleMarkAttendance(user._id, 'absent')}
                                  title="Absent"
                                >
                                  <XCircle size={16} />
                                  Absent
                                </button>
                                <button 
                                  className="btn-attendance late"
                                  onClick={() => handleMarkAttendance(user._id, 'late')}
                                  title="Late"
                                >
                                  <Clock size={16} />
                                  Late
                                </button>
                                <button 
                                  className="btn-attendance excused"
                                  onClick={() => handleMarkAttendance(user._id, 'excused')}
                                  title="Excused"
                                >
                                  <AlertCircle size={16} />
                                  Excused
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
