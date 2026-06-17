import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={`/${user.role}/dashboard`} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Employee Routes */}
      <Route path="/employee/*" element={
        <ProtectedRoute allowedRole="employee">
          <div>Employee Pages Coming Soon</div>
        </ProtectedRoute>
      } />

      {/* Manager Routes */}
      <Route path="/manager/*" element={
        <ProtectedRoute allowedRole="manager">
          <div>Manager Pages Coming Soon</div>
        </ProtectedRoute>
      } />

      {/* Vendor Routes */}
      <Route path="/vendor/*" element={
        <ProtectedRoute allowedRole="vendor">
          <div>Vendor Pages Coming Soon</div>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRole="admin">
          <div>Admin Pages Coming Soon</div>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;