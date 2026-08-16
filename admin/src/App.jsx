import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { apiService } from './services/apiService';
import './styles/AdminLogin.css';
import './styles/AdminDashboard.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminAuthenticated = apiService.isAuthenticated(true);

  useEffect(() => {
    if (location.pathname === '/login' && isAdminAuthenticated) {
      navigate('/dashboard');
    }
  }, [location.pathname, isAdminAuthenticated, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={isAdminAuthenticated ? <Navigate to="/dashboard" replace /> : <AdminLogin />}
      />
      <Route
        path="/dashboard"
        element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
