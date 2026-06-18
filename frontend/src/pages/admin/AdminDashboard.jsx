import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI } from '../../api/adminAPI';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Building2, Package,
  CreditCard, TrendingUp, FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <LoadingSpinner size="lg" />
    </DashboardLayout>
  );

  // Chart data
  const requestChartData = [
    {
      name: 'Requests',
      Total: stats?.requests?.total || 0,
      Approved: stats?.requests?.approved || 0,
      Rejected: stats?.requests?.rejected || 0,
    }
  ];

  const paymentChartData = [
    { name: 'Completed', value: stats?.payments?.completed || 0 },
    { name: 'Pending', value: (stats?.payments?.total || 0) -
      (stats?.payments?.completed || 0) },
  ];

  const COLORS = ['#16a34a', '#f59e0b'];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete platform overview
        </p>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4
        gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={<Users size={24} />}
          color="blue"
        />
        <StatCard
          title="Total Vendors"
          value={stats?.users?.total_vendors || 0}
          icon={<Building2 size={24} />}
          color="purple"
        />
        <StatCard
          title="Purchase Orders"
          value={stats?.orders?.total_purchase_orders || 0}
          icon={<Package size={24} />}
          color="yellow"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.payments?.total_revenue || 0)
            .toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          color="green"
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4
        gap-4 mb-8">
        <StatCard
          title="Total Requests"
          value={stats?.requests?.total || 0}
          icon={<FileText size={24} />}
          color="blue"
        />
        <StatCard
          title="Approved"
          value={stats?.requests?.approved || 0}
          icon={<FileText size={24} />}
          color="green"
        />
        <StatCard
          title="Total Invoices"
          value={stats?.orders?.total_invoices || 0}
          icon={<CreditCard size={24} />}
          color="yellow"
        />
        <StatCard
          title="Payments Done"
          value={stats?.payments?.completed || 0}
          icon={<CreditCard size={24} />}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Bar Chart - Requests */}
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Request Statistics
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={requestChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Total" fill="#3b82f6" />
              <Bar dataKey="Approved" fill="#16a34a" />
              <Bar dataKey="Rejected" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Payments */}
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Payment Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {paymentChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', path: '/admin/users',
              color: 'bg-blue-50 text-blue-700' },
            { label: 'Manage Vendors', path: '/admin/vendors',
              color: 'bg-purple-50 text-purple-700' },
            { label: 'Purchase Orders', path: '/admin/purchase-orders',
              color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Payments', path: '/admin/payments',
              color: 'bg-green-50 text-green-700' },
          ].map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`p-4 rounded-lg font-medium text-sm
                hover:opacity-80 transition-opacity ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;