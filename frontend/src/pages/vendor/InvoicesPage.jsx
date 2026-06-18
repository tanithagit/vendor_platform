import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { vendorAPI } from '../../api/vendorAPI';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Upload } from 'lucide-react';

const InvoicesPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);

  const { register, handleSubmit,
    reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await vendorAPI.getPurchaseOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await vendorAPI.createInvoice({
        purchase_order_id: parseInt(data.purchase_order_id),
        amount: parseFloat(data.amount)
      });

      if (data.invoice_file[0]) {
        await vendorAPI.uploadInvoiceDoc(
          response.data.id,
          data.invoice_file[0]
        );
      }

      toast.success('Invoice created successfully!');
      reset();
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to create invoice');
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
            Invoices
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your invoices
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600
            hover:bg-purple-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* Create Invoice Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Create New Invoice
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Purchase Order ID *
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-purple-500 ${
                      errors.purchase_order_id
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('purchase_order_id', {
                    required: 'Please select a purchase order'
                  })}
                >
                  <option value="">Select Purchase Order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - ₹{order.total_amount}
                    </option>
                  ))}
                </select>
                {errors.purchase_order_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.purchase_order_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Invoice Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Must match PO amount"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-purple-500 ${
                      errors.amount
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('amount', {
                    required: 'Amount is required'
                  })}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.amount.message}
                  </p>
                )}
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Amount must match purchase order amount
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Invoice Document (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:bg-purple-50 file:text-purple-700"
                {...register('invoice_file')}
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
                {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchase Orders with Invoice Status */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">
              No purchase orders found
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
                    Order Number
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}
                    className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      ₹{order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500
                      text-sm">
                      {new Date(order.created_at)
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

export default InvoicesPage;