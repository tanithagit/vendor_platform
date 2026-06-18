import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerAPI } from '../../api/managerAPI';
import toast from 'react-hot-toast';
import { Eye, Check, X, Filter } from 'lucide-react';

const ReviewRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await managerAPI.getAllRequests(filter);
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await managerAPI.approveRequest(id);
      toast.success('Request approved!');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    setProcessing(id);
    try {
      await managerAPI.rejectRequest(id);
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const filters = [
    { value: 'submitted', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Review Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {requests.length} requests found
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100
          rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm
                font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <Filter size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">
              No {filter} requests found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b
                border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Request
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Required Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {req.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        #{req.id} •{' '}
                        {req.description?.substring(0, 40)}
                        {req.description?.length > 40 ? '...' : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      ₹{req.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500
                      text-sm">
                      {new Date(req.required_date)
                        .toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(
                            `/manager/requests/${req.id}`
                          )}
                          className="flex items-center gap-1
                            text-blue-600 hover:text-blue-800
                            text-sm font-medium"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {req.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={processing === req.id}
                              className="flex items-center gap-1
                                bg-green-100 text-green-700
                                hover:bg-green-200 px-2 py-1
                                rounded text-sm font-medium
                                disabled:opacity-50"
                            >
                              <Check size={14} />
                              {processing === req.id
                                ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={processing === req.id}
                              className="flex items-center gap-1
                                bg-red-100 text-red-700
                                hover:bg-red-200 px-2 py-1
                                rounded text-sm font-medium
                                disabled:opacity-50"
                            >
                              <X size={14} />
                              {processing === req.id
                                ? '...' : 'Reject'}
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

export default ReviewRequestsPage;