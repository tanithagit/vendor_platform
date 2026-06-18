import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyRequestsPage from './pages/employee/MyRequestsPage';
import NewRequestPage from './pages/employee/NewRequestPage';
import RequestDetailPage from './pages/employee/RequestDetailPage';

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
      <Route path="/employee/dashboard" element={
        <ProtectedRoute allowedRole="employee">
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee/requests" element={
        <ProtectedRoute allowedRole="employee">
          <MyRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/requests/new" element={
        <ProtectedRoute allowedRole="employee">
          <NewRequestPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/requests/:id" element={
        <ProtectedRoute allowedRole="employee">
          <RequestDetailPage />
        </ProtectedRoute>
      } />

      {/* Manager Routes - Coming Soon */}
      <Route path="/manager/*" element={
        <ProtectedRoute allowedRole="manager">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">
              Manager Dashboard Coming Soon
            </h1>
          </div>
        </ProtectedRoute>
      } />

      {/* Vendor Routes - Coming Soon */}
      <Route path="/vendor/*" element={
        <ProtectedRoute allowedRole="vendor">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">
              Vendor Dashboard Coming Soon
            </h1>
          </div>
        </ProtectedRoute>
      } />

      {/* Admin Routes - Coming Soon */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRole="admin">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">
              Admin Dashboard Coming Soon
            </h1>
          </div>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;