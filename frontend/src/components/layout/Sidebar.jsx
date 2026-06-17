import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, CheckSquare,
  Users, Package, CreditCard, Building2
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = {
    employee: [
      { path: '/employee/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { path: '/employee/requests', icon: <FileText size={18} />, label: 'My Requests' },
      { path: '/employee/requests/new', icon: <FileText size={18} />, label: 'New Request' },
    ],
    manager: [
      { path: '/manager/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { path: '/manager/requests', icon: <CheckSquare size={18} />, label: 'Review Requests' },
      { path: '/manager/history', icon: <FileText size={18} />, label: 'History' },
    ],
    vendor: [
      { path: '/vendor/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { path: '/vendor/quotations', icon: <FileText size={18} />, label: 'My Quotations' },
      { path: '/vendor/purchase-orders', icon: <Package size={18} />, label: 'Purchase Orders' },
      { path: '/vendor/invoices', icon: <CreditCard size={18} />, label: 'Invoices' },
    ],
    admin: [
      { path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { path: '/admin/users', icon: <Users size={18} />, label: 'Users' },
      { path: '/admin/vendors', icon: <Building2 size={18} />, label: 'Vendors' },
      { path: '/admin/purchase-orders', icon: <Package size={18} />, label: 'Purchase Orders' },
      { path: '/admin/payments', icon: <CreditCard size={18} />, label: 'Payments' },
    ],
  };

  const items = menuItems[user?.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 
      min-h-screen p-4">
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg 
              text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;