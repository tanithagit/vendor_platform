import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerAPI } from '../../api/managerAPI';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await managerAPI.getHistory();
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to load history');
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
          Approval History
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          All approved and rejected requests
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {history.length === 0 ? (
          <div className="p-12 text-center">
            <History size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">No history yet</p>
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
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((req) => (
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

export default HistoryPage;