import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI } from '../../api/adminAPI';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Building2 } from 'lucide-react';

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit,
    reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await adminAPI.getAllVendors();
      setVendors(response.data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await adminAPI.createVendor(data);
      toast.success('Vendor created successfully!');
      reset();
      setShowForm(false);
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to create vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await adminAPI.deleteVendor(id);
      toast.success('Vendor deleted');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to delete vendor');
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
            Manage Vendors
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {vendors.length} vendors registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600
            hover:bg-purple-700 text-white px-4 py-2
            rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      {/* Create Vendor Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Create New Vendor
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  placeholder="Company name"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-purple-500 ${
                      errors.vendor_name
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('vendor_name', {
                    required: 'Vendor name is required'
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="vendor@company.com"
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-purple-500 ${
                      errors.email
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  {...register('email', {
                    required: 'Email is required'
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="9876543210"
                  className="w-full px-4 py-2 border
                    border-gray-300 rounded-lg focus:outline-none
                    focus:ring-2 focus:ring-purple-500"
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="123 Street, City"
                  className="w-full px-4 py-2 border
                    border-gray-300 rounded-lg focus:outline-none
                    focus:ring-2 focus:ring-purple-500"
                  {...register('address')}
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
                className="px-6 py-2 bg-purple-600
                  hover:bg-purple-700 text-white rounded-lg
                  disabled:opacity-50 font-medium"
              >
                {submitting ? 'Creating...' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vendors Table */}
      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {vendors.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">No vendors yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b
                border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Vendor Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id}
                    className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      {vendor.vendor_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {vendor.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {vendor.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
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

export default VendorsPage;