import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { employeeAPI } from '../../api/employeeAPI';
import toast from 'react-hot-toast';
import {
  FileText, Clock, CheckCircle,
  XCircle, Plus, Eye
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await employeeAPI.getMyRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'submitted').length,
    approved:  requests.filter(r => r.status === 'approved').length,
    rejected:  requests.filter(r => r.status === 'rejected').length,
  };

  // Get recent 5 requests
  const recentRequests = requests.slice(0, 5);

  if (loading) return (
    <DashboardLayout>
      <LoadingSpinner size="lg" />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your purchase requests
          </p>
        </div>
        <button
          onClick={() => navigate('/employee/requests/new')}
          className="flex items-center gap-2 bg-blue-600
            hover:bg-blue-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={<FileText size={24} />}
          color="blue"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock size={24} />}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle size={24} />}
          color="red"
        />
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        <div className="flex items-center justify-between p-6
          border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Recent Requests
          </h2>
          <button
            onClick={() => navigate('/employee/requests')}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No requests yet</p>
            <button
              onClick={() => navigate('/employee/requests/new')}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Create your first request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {req.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        #{req.id}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      ₹{req.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(
                          `/employee/requests/${req.id}`
                        )}
                        className="flex items-center gap-1 text-blue-600
                          hover:text-blue-800 text-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;