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

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ReviewRequestsPage from './pages/manager/ReviewRequestsPage';
import ManagerRequestDetail from './pages/manager/ManagerRequestDetail';
import HistoryPage from './pages/manager/HistoryPage';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import QuotationsPage from './pages/vendor/QuotationsPage';
import PurchaseOrdersPage from './pages/vendor/PurchaseOrdersPage';
import InvoicesPage from './pages/vendor/InvoicesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import VendorsPage from './pages/admin/VendorsPage';
import AdminPurchaseOrdersPage from './pages/admin/AdminPurchaseOrdersPage';
import PaymentsPage from './pages/admin/PaymentsPage';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        user
          ? <Navigate to={`/${user.role}/dashboard`} replace />
          : <Navigate to="/login" replace />
      } />

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

      {/* Manager Routes */}
      <Route path="/manager/dashboard" element={
        <ProtectedRoute allowedRole="manager">
          <ManagerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/manager/requests" element={
        <ProtectedRoute allowedRole="manager">
          <ReviewRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/manager/requests/:id" element={
        <ProtectedRoute allowedRole="manager">
          <ManagerRequestDetail />
        </ProtectedRoute>
      } />
      <Route path="/manager/history" element={
        <ProtectedRoute allowedRole="manager">
          <HistoryPage />
        </ProtectedRoute>
      } />

      {/* Vendor Routes */}
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute allowedRole="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/vendor/quotations" element={
        <ProtectedRoute allowedRole="vendor">
          <QuotationsPage />
        </ProtectedRoute>
      } />
      <Route path="/vendor/purchase-orders" element={
        <ProtectedRoute allowedRole="vendor">
          <PurchaseOrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/vendor/invoices" element={
        <ProtectedRoute allowedRole="vendor">
          <InvoicesPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRole="admin">
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/vendors" element={
        <ProtectedRoute allowedRole="admin">
          <VendorsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/purchase-orders" element={
        <ProtectedRoute allowedRole="admin">
          <AdminPurchaseOrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/payments" element={
        <ProtectedRoute allowedRole="admin">
          <PaymentsPage />
        </ProtectedRoute>
      } />

      <Route path="*"
        element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;