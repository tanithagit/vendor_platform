import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { employeeAPI } from '../../api/employeeAPI';
import toast from 'react-hot-toast';
import { Plus, Eye, Send, FileText } from 'lucide-react';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
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

  const handleSubmit = async (requestId) => {
    setSubmitting(requestId);
    try {
      await employeeAPI.submitRequest(requestId);
      toast.success('Request submitted for review!');
      fetchRequests(); // Refresh list
    } catch (error) {
      const msg = error.response?.data?.detail
        || 'Failed to submit request';
      toast.error(msg);
    } finally {
      setSubmitting(null);
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
            My Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {requests.length} total requests
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

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No requests found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first purchase request
            </p>
            <button
              onClick={() => navigate('/employee/requests/new')}
              className="mt-4 bg-blue-600 text-white px-4 py-2
                rounded-lg text-sm hover:bg-blue-700"
            >
              Create Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b
                border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Title
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
                    Created
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50
                    transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {req.title}
                      </p>
                      {req.description && (
                        <p className="text-xs text-gray-500 mt-0.5
                          truncate max-w-xs">
                          {req.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      ₹{req.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(req.required_date)
                        .toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(
                            `/employee/requests/${req.id}`
                          )}
                          className="flex items-center gap-1
                            text-blue-600 hover:text-blue-800
                            text-sm font-medium"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {req.status === 'draft' && (
                          <button
                            onClick={() => handleSubmit(req.id)}
                            disabled={submitting === req.id}
                            className="flex items-center gap-1
                              text-green-600 hover:text-green-800
                              text-sm font-medium disabled:opacity-50"
                          >
                            <Send size={14} />
                            {submitting === req.id
                              ? 'Submitting...'
                              : 'Submit'
                            }
                          </button>
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

export default MyRequestsPage;