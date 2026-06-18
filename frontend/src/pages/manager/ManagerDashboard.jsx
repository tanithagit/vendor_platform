import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerAPI } from '../../api/managerAPI';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, Clock,
  FileText, Eye, Check, X
} from 'lucide-react';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        managerAPI.getDashboard(),
        managerAPI.getAllRequests()
      ]);
      setStats(statsRes.data);
      setPendingRequests(requestsRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await managerAPI.approveRequest(id);
      toast.success('Request approved successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await managerAPI.rejectRequest(id);
      toast.success('Request rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to reject');
    }
  };

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
            Manager Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage purchase requests
          </p>
        </div>
        <button
          onClick={() => navigate('/manager/requests')}
          className="flex items-center gap-2 bg-green-600
            hover:bg-green-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <FileText size={18} />
          View All Requests
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4
          gap-4 mb-8">
          <StatCard
            title="Total Requests"
            value={stats.total_requests}
            icon={<FileText size={24} />}
            color="blue"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending_review}
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
      )}

      {/* Pending Requests */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        <div className="flex items-center justify-between
          p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Pending Requests
          </h2>
          <button
            onClick={() => navigate('/manager/requests')}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">
              No pending requests
            </p>
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
                {pendingRequests.map((req) => (
                  <tr key={req.id}
                    className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-gray-500
                      text-sm">
                      {new Date(req.created_at)
                        .toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(
                            `/manager/requests/${req.id}`
                          )}
                          className="flex items-center gap-1
                            text-blue-600 hover:text-blue-800
                            text-sm"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {req.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="flex items-center gap-1
                                text-green-600 hover:text-green-800
                                text-sm font-medium"
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="flex items-center gap-1
                                text-red-600 hover:text-red-800
                                text-sm font-medium"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
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

export default ManagerDashboard;