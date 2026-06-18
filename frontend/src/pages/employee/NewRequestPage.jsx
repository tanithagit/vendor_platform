import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { employeeAPI } from '../../api/employeeAPI';
import toast from 'react-hot-toast';
import { FileText, Upload, ArrowLeft } from 'lucide-react';

const NewRequestPage = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const requestData = {
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        required_date: new Date(data.required_date).toISOString(),
      };

      const response = await employeeAPI.createRequest(requestData);
      const requestId = response.data.id;
      setCreatedRequestId(requestId);

      // Upload file if selected
      if (data.document[0]) {
        setUploadingFile(true);
        try {
          await employeeAPI.uploadDocument(requestId, data.document[0]);
          setUploadedFile(data.document[0].name);
          toast.success('Request created with document!');
        } catch (uploadError) {
          toast.success('Request created! (Document upload failed)');
        } finally {
          setUploadingFile(false);
        }
      } else {
        toast.success('Purchase request created successfully!');
      }

      navigate('/employee/requests');
    } catch (error) {
      const msg = error.response?.data?.detail
        || 'Failed to create request';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            New Purchase Request
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border
          border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Request Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Office Laptops for Development Team"
                className={`w-full px-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.title
                    ? 'border-red-400'
                    : 'border-gray-300'
                  }`}
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  }
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe what you need and why..."
                className="w-full px-4 py-3 border border-gray-300
                  rounded-lg focus:outline-none focus:ring-2
                  focus:ring-blue-500 resize-none"
                {...register('description')}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Budget Amount (₹) *
              </label>
              <input
                type="number"
                placeholder="50000"
                min="1"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.amount
                    ? 'border-red-400'
                    : 'border-gray-300'
                  }`}
                {...register('amount', {
                  required: 'Amount is required',
                  min: {
                    value: 1,
                    message: 'Amount must be greater than 0'
                  }
                })}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Required Date */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Required By Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.required_date
                    ? 'border-red-400'
                    : 'border-gray-300'
                  }`}
                {...register('required_date', {
                  required: 'Required date is needed'
                })}
              />
              {errors.required_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.required_date.message}
                </p>
              )}
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Supporting Document (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300
                rounded-lg p-6 text-center hover:border-blue-400
                transition-colors">
                <Upload size={24} className="text-gray-400
                  mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Upload PDF or Image
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  {...register('document')}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/employee/requests')}
                className="flex-1 px-4 py-3 border border-gray-300
                  text-gray-700 rounded-lg hover:bg-gray-50
                  transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingFile}
                className="flex-1 bg-blue-600 hover:bg-blue-700
                  disabled:bg-blue-400 text-white font-medium
                  py-3 rounded-lg transition-colors flex items-center
                  justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white
                      border-t-transparent rounded-full animate-spin">
                    </div>
                    {uploadingFile
                      ? 'Uploading...'
                      : 'Creating...'
                    }
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Create Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewRequestPage;