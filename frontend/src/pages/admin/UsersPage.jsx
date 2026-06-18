import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminAPI } from '../../api/adminAPI';
import toast from 'react-hot-toast';
import { Trash2, Users } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail
        || 'Failed to delete');
    }
  };

  const roleColors = {
    employee: 'bg-blue-100 text-blue-700',
    manager:  'bg-green-100 text-green-700',
    vendor:   'bg-purple-100 text-purple-700',
    admin:    'bg-red-100 text-red-700',
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
          Manage Users
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} total users
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border
        border-gray-100">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-gray-300
              mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b
                border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="text-left px-6 py-4 text-xs
                    font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id}
                    className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium
                      text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full
                        text-xs font-medium capitalize
                        ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500
                      text-sm">
                      {new Date(user.created_at)
                        .toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700
                          transition-colors"
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

export default UsersPage;