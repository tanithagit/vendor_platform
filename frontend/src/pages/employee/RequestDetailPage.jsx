import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { employeeAPI } from '../../api/employeeAPI';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, FileText, Calendar,
  DollarSign } from 'lucide-react';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await employeeAPI.getRequestById(id);
      setRequest(response.data);
    } catch (error) {
      toast.error('Request not found');
      navigate('/employee/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await employeeAPI.submitRequest(id);
      toast.success('Request submitted for manager review!');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to submit');
    } finally {
      setSubmitting(false);
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
          onClick={() => navigate('/employee/requests')}
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
        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Request Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-gray-800">
                  {request.description || 'No description provided'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Budget Amount</p>
                <p className="text-gray-800 font-semibold">
                  ₹{request.amount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Required By</p>
                <p className="text-gray-800">
                  {new Date(request.required_date)
                    .toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Created On</p>
                <p className="text-gray-800">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {request.document_url && (
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Document</p>
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

        {/* Action Card */}
        {request.status === 'draft' && (
          <div className="bg-yellow-50 border border-yellow-200
            rounded-xl p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Ready to Submit?
            </h3>
            <p className="text-yellow-700 text-sm mb-4">
              Submit this request for manager review.
              Once submitted, it cannot be edited.
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-yellow-600
                hover:bg-yellow-700 text-white px-4 py-2
                rounded-lg transition-colors font-medium
                disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="bg-green-50 border border-green-200
            rounded-xl p-6">
            <h3 className="font-semibold text-green-800">
              ✅ Request Approved!
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Your request has been approved.
              The procurement team will proceed with the purchase.
            </p>
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200
            rounded-xl p-6">
            <h3 className="font-semibold text-red-800">
              ❌ Request Rejected
            </h3>
            <p className="text-red-700 text-sm mt-1">
              Your request has been rejected.
              Please contact your manager for more information.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RequestDetailPage;