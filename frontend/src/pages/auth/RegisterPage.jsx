import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Lock, Mail,
  User, Building2, Shield
} from 'lucide-react';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.register(data);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.detail
        || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'employee', label: '👤 Employee', desc: 'Create purchase requests' },
    { value: 'manager', label: '👔 Manager', desc: 'Approve/reject requests' },
    { value: 'vendor', label: '🏢 Vendor', desc: 'Submit quotations & invoices' },
    { value: 'admin', label: '⚙️ Admin', desc: 'Manage entire platform' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 
      to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full 
        max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl 
            flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="text-gray-500 mt-1">
            Join the Procurement Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 
                -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors ${
                    errors.name
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 
                -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors ${
                    errors.email
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email'
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 
                -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors ${
                    errors.password
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                  text-gray-400 hover:text-gray-600"
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className="cursor-pointer"
                >
                  <input
                    type="radio"
                    value={role.value}
                    className="sr-only peer"
                    {...register('role', {
                      required: 'Please select a role'
                    })}
                  />
                  <div className="border-2 rounded-lg p-3 
                    peer-checked:border-blue-500 
                    peer-checked:bg-blue-50
                    hover:border-gray-400 transition-colors">
                    <p className="font-medium text-sm text-gray-800">
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {role.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700
              disabled:bg-blue-400 text-white font-semibold
              py-3 rounded-lg transition-colors flex items-center
              justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white
                  border-t-transparent rounded-full animate-spin">
                </div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;