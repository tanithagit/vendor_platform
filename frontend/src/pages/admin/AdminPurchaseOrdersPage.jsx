import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI } from '../../api/adminAPI';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Package } from 'lucide-react';

const AdminPurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit,
    reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, vendorsRes] = await Promise.all([
        adminAPI.getAllPurchaseOrders(),
        adminAPI.getAllVendors()
      ]);
      setOrders(ordersRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await adminAPI.createPurchaseOrder({
        request_id: parseInt(data.request_id),
        vendor_id: parseInt(data.vendor_id),
        total_amount: parseFloat(data.total_amount)
      });
      toast.success('Purchase order created!');
      reset();
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to create purchase order');
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
            Purchase Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} total orders
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600
            hover:bg-blue-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          Generate PO
        </button>
      </div>

      {/* Create PO Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Generate Purchase Order
          </h2>
          <p className="text-sm text-yellow-600 mb-4">
            ⚠️ Only approved requests can generate purchase orders
          </p>
          <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Request ID *
                </label>
                <input
                  type="number"
                  placeholder="Approved request ID"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-blue-500 ${
                      errors.request_id
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('request_id', {
                    required: 'Request ID is required'
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Select Vendor *
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-blue-500 ${
                      errors.vendor_id
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('vendor_id', {
                    required: 'Please select a vendor'
                  })}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendor_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Total Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Order amount"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-blue-500 ${
                      errors.total_amount
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('total_amount', {
                    required: 'Amount is required'
                  })}
                />
              </div>
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
                className="px-6 py-2 bg-blue-600
                  hover:bg-blue-700 text-white rounded-lg
                  disabled:opacity-50 font-medium"
              >
                {submitting ? 'Creating...' : 'Generate PO'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">
              No purchase orders yet
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
                    Request ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Vendor ID
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
                    <td className="px-6 py-4 text-gray-500">
                      #{order.request_id}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      #{order.vendor_id}
                    </td>
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
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

export default AdminPurchaseOrdersPage;