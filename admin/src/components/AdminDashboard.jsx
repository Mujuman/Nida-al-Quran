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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceCourse, setAttendanceCourse] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const statsCards = [
    { label: 'Total Students', value: stats.totalUsers || 0, icon: Users, color: 'blue' },
    { label: 'Pending', value: stats.pendingRegistrations || 0, icon: Clock, color: 'gold' },
    { label: 'Approved', value: stats.approvedRegistrations || 0, icon: CheckCircle, color: 'green' },
    { label: 'Messages', value: stats.totalContacts || 0, icon: Mail, color: 'purple' },
  ];

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
              ...(isMainAdmin ? [{ id: 'subadmins', label: 'Sub Admins', icon: UserPlus }] : []),
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
                    {users.map((user) => (
                      <tr key={user._id || user.id}>
                        <td>{user.fullName || user.name || 'Unknown'}</td>
                        <td>{user.email || '-'}</td>
                        <td>
                          <span className={`status-badge ${user.registrationStatus || 'pending'}`}>
                            {user.registrationStatus || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button className="mini-btn" onClick={() => setSelectedUser(user)}>
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
                    {contacts.map((contact) => (
                      <tr key={contact._id || contact.id}>
                        <td>{contact.name || 'Unknown'}</td>
                        <td>{contact.email || '-'}</td>
                        <td>{contact.message?.slice(0, 60) || '-'}</td>
                        <td>
                          <button className="mini-btn" onClick={() => setSelectedContact(contact)}>
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
              </div>
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((item) => (
                      <tr key={item._id || item.id}>
                        <td>{item.studentName || 'Unknown'}</td>
                        <td>{item.course || '-'}</td>
                        <td>{item.date || '-'}</td>
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
              </div>
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subAdmins.map((admin) => (
                      <tr key={admin._id || admin.id}>
                        <td>{admin.fullName || 'Unknown'}</td>
                        <td>{admin.email || '-'}</td>
                        <td>{admin.role || 'sub_admin'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
