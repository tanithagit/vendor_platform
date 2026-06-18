import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { vendorAPI } from '../../api/vendorAPI';
import toast from 'react-hot-toast';
import {
  FileText, Package, CreditCard,
  CheckCircle, Plus
} from 'lucide-react';

const VendorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        vendorAPI.getDashboard(),
        vendorAPI.getPurchaseOrders()
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.slice(0, 5));
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Vendor Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats?.vendor_name || 'Welcome'}
          </p>
        </div>
        <button
          onClick={() => navigate('/vendor/quotations/new')}
          className="flex items-center gap-2 bg-purple-600
            hover:bg-purple-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          Submit Quotation
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4
          gap-4 mb-8">
          <StatCard
            title="Total Quotations"
            value={stats.total_quotations}
            icon={<FileText size={24} />}
            color="purple"
          />
          <StatCard
            title="Purchase Orders"
            value={stats.total_purchase_orders}
            icon={<Package size={24} />}
            color="blue"
          />
          <StatCard
            title="Total Invoices"
            value={stats.total_invoices}
            icon={<CreditCard size={24} />}
            color="yellow"
          />
          <StatCard
            title="Paid Invoices"
            value={stats.paid_invoices}
            icon={<CheckCircle size={24} />}
            color="green"
          />
        </div>
      )}

      {/* Recent Purchase Orders */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        <div className="flex items-center justify-between
          p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Recent Purchase Orders
          </h2>
          <button
            onClick={() => navigate('/vendor/purchase-orders')}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

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
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Order Number
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs
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

export default VendorDashboard;