import { useState, useEffect, useCallback } from 'react';
import {
  Users, Mail, BarChart3, LogOut, Menu, X, Clock, CheckCircle,
  XCircle, Eye, Trash2, Send, Calendar, Filter, Search, Download,
  UserCheck, AlertCircle, Shield, ShieldCheck, UserPlus, Edit2,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

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
  const [attendanceMarking, setAttendanceMarking] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    course: '',
    notes: '',
  });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const handleOpenUser = async (user) => {
    try {
      const userDetails = await apiService.getUserDetails(user._id || user.id);
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
      setSelectedContact((prev) => ({ ...prev, reply: replyText.trim(), status: 'replied' }));
      setReplyText('');
      fetchDashboardData();
    } catch (err) {
      console.error('Error sending reply:', err);
      showMessage(err?.message || 'Unable to send reply.', 'error');
    }
  };

  const handleCreateSubAdmin = async (event) => {
    event.preventDefault();

    try {
      const response = await apiService.createSubAdmin(newSubAdmin);
      showMessage(response?.msg || 'Sub-admin created successfully.', 'success');
      setShowCreateSubAdminModal(false);
      setNewSubAdmin({ username: '', email: '', password: '', fullName: '', phone: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating sub-admin:', err);
      showMessage(err?.message || 'Could not create sub-admin.', 'error');
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
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error marking attendance:', err);
      showMessage(err?.message || 'Unable to mark attendance.', 'error');
    }
  };

  const statsCards = [
    { label: 'Total Students', value: stats.totalUsers || 0, icon: Users, color: 'blue' },
    { label: 'Pending', value: stats.pendingRegistrations || 0, icon: Clock, color: 'gold' },
    { label: 'Approved', value: stats.approvedRegistrations || 0, icon: CheckCircle, color: 'green' },
    { label: 'Messages', value: stats.totalContacts || 0, icon: Mail, color: 'purple' },
  ];
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
    contact.name, contact.email, contact.message,
  ]));
  const filteredAttendance = attendance.filter((item) => matchesSearch([
    item.student?.fullName, item.studentName, item.course, item.recordedBy?.fullName,
    item.status, item.date && new Date(item.date).toLocaleDateString(),
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
                  {isMainAdmin ? 'Main Admin' : 'Sub Admin'}
                </span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={`toast-alert toast-${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="admin-layout">
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">Management</div>
          <nav className="sidebar-nav">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Students', icon: Users },
              { id: 'contacts', label: 'Messages', icon: Mail },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              ...(isMainAdmin ? [
                { id: 'assign-students', label: 'Assign Students', icon: UserCheck },
                { id: 'subadmins', label: 'Sub Admins', icon: UserPlus },
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
                  <p className="eyebrow">Overview</p>
                  <h2>Dashboard</h2>
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

              <div className="recent-students-section">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Latest activity</p>
                    <h3>Recent Registered Students</h3>
                  </div>
                  <button className="btn-secondary" onClick={() => switchTab('users')}>
                    View All Students
                  </button>
                </div>
                {searchBar('Search recent students')}

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
                  <p className="eyebrow">Students</p>
                  <h2>Student Management</h2>
                </div>
              </div>
              {searchBar('Search students by name, email, or status')}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Messages</p>
                  <h2>Contact Messages</h2>
                </div>
              </div>
              {searchBar('Search messages by name, email, or text')}
              <div className="table-card">
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
                        <td>{contact.name || 'Unknown'}</td>
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
                  <p className="eyebrow">Attendance</p>
                  <h2>Attendance Management</h2>
                </div>
                {!isMainAdmin && (
                  <button className="btn-primary" onClick={() => setShowMarkAttendanceModal(true)}>
                    + Mark Attendance
                  </button>
                )}
              </div>
              {searchBar('Search attendance records')}
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Date</th>
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
                  <h2>Sub-admin Management</h2>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateSubAdminModal(true)}>
                  + Create Sub Admin
                </button>
              </div>
              {searchBar('Search sub-admins by name, email, or username')}
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubAdmins.map((admin) => (
                      <tr key={admin._id || admin.id}>
                        <td>{admin.fullName || 'Unknown'}</td>
                        <td>{admin.email || '-'}</td>
                        <td>{admin.username || '-'}</td>
                        <td>{admin.role || 'sub_admin'}</td>
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
                  <h2>Assign Students to Sub-admins</h2>
                </div>
              </div>
              {searchBar('Search students to assign')}
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
                </div>
              </div>

              {/* Guardian Information */}
              <div className="detail-section">
                <h4 className="section-title">Guardian Information</h4>
                <div className="detail-grid">
                  <div className="detail-item"><span>Guardian Name</span><strong>{selectedUser.guardian || '-'}</strong></div>
                  <div className="detail-item"><span>Guardian Phone</span><strong>{selectedUser.guardianPhone || '-'}</strong></div>
                </div>
              </div>

              {/* Registration & Account Status */}
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
                      <strong>{selectedUser.assignedTeacher}</strong>
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
              <select
                value={selectedUser.registrationStatus || 'pending'}
                onChange={(e) => handleUserStatusUpdate(e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className="btn-primary" onClick={() => setShowUserModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedContact && (
        <div className="modal-backdrop" onClick={() => setShowReplyModal(false)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
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

      {showCreateSubAdminModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateSubAdminModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Create manager</p>
                <h3>Create Sub Admin</h3>
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
                <h3>Assign to Sub-admin</h3>
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
                Select Sub-admin
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
