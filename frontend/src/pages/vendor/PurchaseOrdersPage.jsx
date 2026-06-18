import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { vendorAPI } from '../../api/vendorAPI';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';

const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await vendorAPI.getPurchaseOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load purchase orders');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Purchase Orders
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Orders assigned to you
        </p>
      </div>

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
                    Total Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Created Date
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

export default PurchaseOrdersPage;