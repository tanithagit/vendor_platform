import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerAPI } from '../../api/managerAPI';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Check, X,
  FileText, Calendar, DollarSign
} from 'lucide-react';

const ManagerRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await managerAPI.getRequestById(id);
      setRequest(response.data);
    } catch (error) {
      toast.error('Request not found');
      navigate('/manager/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing('approve');
    try {
      await managerAPI.approveRequest(id);
      toast.success('Request approved!');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    setProcessing('reject');
    try {
      await managerAPI.rejectRequest(id);
      toast.success('Request rejected');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to reject');
    } finally {
      setProcessing(null);
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/manager/requests')}
          className="flex items-center gap-1 text-gray-500
            hover:text-gray-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            {request.title}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Request #{request.id}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Request Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText size={18}
                className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">
                  Description
                </p>
                <p className="text-gray-800">
                  {request.description || 'No description'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign size={18}
                className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">
                  Budget Amount
                </p>
                <p className="text-gray-800 font-semibold text-lg">
                  ₹{request.amount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18}
                className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">
                  Required By
                </p>
                <p className="text-gray-800">
                  {new Date(request.required_date)
                    .toLocaleDateString()}
                </p>
              </div>
            </div>
            {request.document_url && (
              <div className="flex items-start gap-3">
                <FileText size={18}
                  className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">
                    Supporting Document
                  </p>
                  <a
                    href={request.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Document
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {request.status === 'submitted' && (
          <div className="bg-white rounded-xl shadow-sm border
            border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Take Action
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={!!processing}
                className="flex-1 flex items-center justify-center
                  gap-2 bg-green-600 hover:bg-green-700
                  disabled:bg-green-400 text-white font-medium
                  py-3 rounded-lg transition-colors"
              >
                <Check size={18} />
                {processing === 'approve'
                  ? 'Approving...'
                  : 'Approve Request'
                }
              </button>
              <button
                onClick={handleReject}
                disabled={!!processing}
                className="flex-1 flex items-center justify-center
                  gap-2 bg-red-600 hover:bg-red-700
                  disabled:bg-red-400 text-white font-medium
                  py-3 rounded-lg transition-colors"
              >
                <X size={18} />
                {processing === 'reject'
                  ? 'Rejecting...'
                  : 'Reject Request'
                }
              </button>
            </div>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="bg-green-50 border border-green-200
            rounded-xl p-6">
            <h3 className="font-semibold text-green-800">
              ✅ You approved this request
            </h3>
            <p className="text-green-700 text-sm mt-1">
              The procurement team will now proceed
              with the purchase order.
            </p>
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200
            rounded-xl p-6">
            <h3 className="font-semibold text-red-800">
              ❌ This request was rejected
            </h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerRequestDetail;