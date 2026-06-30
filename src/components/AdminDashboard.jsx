import React, { useState, useEffect } from 'react';
import { Users, Mail, BarChart3, LogOut, Menu, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../services/apiService';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.clearToken(true);
    window.location.href = '/admin/login';
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await apiService.updateUserStatus(userId, {
        registrationStatus: newStatus
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

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

      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
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
                fetchDashboardData();
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
                fetchDashboardData();
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
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                  <span className="stat-label">Registered Students</span>
                </div>
                <div className="stat-card pending">
                  <h3>Pending</h3>
                  <p className="stat-number">{stats.pendingRegistrations}</p>
                  <span className="stat-label">Awaiting Approval</span>
                </div>
                <div className="stat-card approved">
                  <h3>Approved</h3>
                  <p className="stat-number">{stats.approvedRegistrations}</p>
                  <span className="stat-label">Active Students</span>
                </div>
                <div className="stat-card">
                  <h3>Total Messages</h3>
                  <p className="stat-number">{stats.totalContacts}</p>
                  <span className="stat-label">Contact Submissions</span>
                </div>
                <div className="stat-card warning">
                  <h3>New Messages</h3>
                  <p className="stat-number">{stats.newContacts}</p>
                  <span className="stat-label">Unread</span>
                </div>
                <div className="stat-card">
                  <h3>This Month</h3>
                  <p className="stat-number">{stats.monthlyAttendance}</p>
                  <span className="stat-label">Attendance Records</span>
                </div>
              </div>
            </section>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section className="users-section">
              <h2>Manage Users</h2>
              {isLoading ? (
                <p>Loading users...</p>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id}>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.course || '-'}</td>
                          <td>
                            <span className={`status-badge ${user.registrationStatus}`}>
                              {user.registrationStatus}
                            </span>
                          </td>
                          <td className="actions">
                            {user.registrationStatus === 'pending' && (
                              <>
                                <button
                                  className="btn-approve"
                                  onClick={() => handleUpdateUserStatus(user._id, 'approved')}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handleUpdateUserStatus(user._id, 'rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button className="btn-view">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <section className="contacts-section">
              <h2>Contact Messages</h2>
              {isLoading ? (
                <p>Loading messages...</p>
              ) : (
                <div className="contacts-list">
                  {contacts.map(contact => (
                    <div key={contact._id} className="contact-card">
                      <div className="contact-header">
                        <h4>{contact.subject}</h4>
                        <span className={`status-badge ${contact.status}`}>
                          {contact.status}
                        </span>
                      </div>
                      <p className="contact-from">From: {contact.fullName} ({contact.email})</p>
                      <p className="contact-message">{contact.message.substring(0, 150)}...</p>
                      <div className="contact-actions">
                        <button className="btn-small">Reply</button>
                        <button className="btn-small">Delete</button>
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
              <h2>Attendance Management</h2>
              <div className="attendance-content">
                <p>Attendance tracking system coming soon...</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
