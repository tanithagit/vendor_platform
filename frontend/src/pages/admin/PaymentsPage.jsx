import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI } from '../../api/adminAPI';
import toast from 'react-hot-toast';
import { CreditCard, Check } from 'lucide-react';

const PaymentsPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, paymentsRes] = await Promise.all([
        adminAPI.getAllInvoices(),
        adminAPI.getAllPayments()
      ]);
      setInvoices(invoicesRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async (invoice) => {
    setProcessing(invoice.id);
    try {
      await adminAPI.initiatePayment({
        invoice_id: invoice.id,
        amount: invoice.amount
      });
      toast.success('Payment initiated!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to initiate payment');
    } finally {
      setProcessing(null);
    }
  };

  const handleCompletePayment = async (paymentId) => {
    setProcessing(paymentId);
    try {
      await adminAPI.completePayment(paymentId);
      toast.success('Payment completed! Invoice marked as paid.');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to complete payment');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Payments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Process invoice payments
        </p>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Pending Invoices
          </h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Invoice ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    PO ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}
                    className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      #{invoice.id}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      #{invoice.purchase_order_id}
                    </td>
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      ₹{invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={invoice.payment_status} />
                    </td>
                    <td className="px-6 py-4">
                      {invoice.payment_status === 'pending' && (
                        <button
                          onClick={() =>
                            handleInitiatePayment(invoice)}
                          disabled={processing === invoice.id}
                          className="flex items-center gap-1
                            bg-blue-100 text-blue-700
                            hover:bg-blue-200 px-3 py-1
                            rounded text-sm font-medium
                            disabled:opacity-50"
                        >
                          {processing === invoice.id
                            ? 'Processing...'
                            : 'Initiate Payment'
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments Section */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Payment Records
          </h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Payment ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Invoice ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id}
                    className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      #{payment.invoice_id}
                    </td>
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() =>
                            handleCompletePayment(payment.id)}
                          disabled={processing === payment.id}
                          className="flex items-center gap-1
                            bg-green-100 text-green-700
                            hover:bg-green-200 px-3 py-1
                            rounded text-sm font-medium
                            disabled:opacity-50"
                        >
                          <Check size={14} />
                          {processing === payment.id
                            ? 'Processing...'
                            : 'Complete Payment'
                          }
                        </button>
                      )}
                      {payment.status === 'completed' && (
                        <span className="text-green-600
                          text-sm font-medium">
                          ✅ Paid
                        </span>
                      )}
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

export default PaymentsPage;