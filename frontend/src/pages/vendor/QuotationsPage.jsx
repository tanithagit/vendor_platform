import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { vendorAPI } from '../../api/vendorAPI';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, FileText, Upload } from 'lucide-react';

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit,
    reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await vendorAPI.getMyQuotations();
      setQuotations(response.data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await vendorAPI.submitQuotation({
        request_id: parseInt(data.request_id),
        quoted_amount: parseFloat(data.quoted_amount)
      });

      // Upload document if provided
      if (data.document[0]) {
        await vendorAPI.uploadQuotationDoc(
          response.data.id,
          data.document[0]
        );
      }

      toast.success('Quotation submitted successfully!');
      reset();
      setShowForm(false);
      fetchQuotations();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to submit quotation');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Quotations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {quotations.length} quotations submitted
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600
            hover:bg-purple-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          New Quotation
        </button>
      </div>

      {/* Submit Quotation Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Submit New Quotation
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Purchase Request ID *
                </label>
                <input
                  type="number"
                  placeholder="Enter request ID"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-purple-500 ${
                      errors.request_id
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('request_id', {
                    required: 'Request ID is required'
                  })}
                />
                {errors.request_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.request_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Quoted Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Enter your price"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-purple-500 ${
                      errors.quoted_amount
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('quoted_amount', {
                    required: 'Amount is required'
                  })}
                />
                {errors.quoted_amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.quoted_amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Quotation Document (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100"
                {...register('document')}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300
                  text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600
                  hover:bg-purple-700 text-white rounded-lg
                  disabled:opacity-50 font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Quotation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotations Table */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {quotations.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">
              No quotations submitted yet
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
                    ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Request ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Quoted Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Document
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      #{q.id}
                    </td>
                    <td className="px-6 py-4 text-gray-800
                      font-medium">
                      Request #{q.request_id}
                    </td>
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      ₹{q.quoted_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {q.document_url ? (
                        <a
                          href={q.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600
                            hover:underline text-sm"
                        >
                          View Doc
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No document
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500
                      text-sm">
                      {new Date(q.submitted_at)
                        .toLocaleDateString()}
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

export default QuotationsPage;