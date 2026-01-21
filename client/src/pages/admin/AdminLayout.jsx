import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { LoadingScreen } from '../../components/common';

export default function AdminLayout() {
  const { admin, loading, isAdminAuthenticated, adminLogout, hasPermission } = useAdmin();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', permission: 'view_stats', end: true },
    { to: '/admin/users', label: 'Users', permission: 'view_users' },
    { to: '/admin/profiles', label: 'Profiles', permission: 'view_profiles' },
    { to: '/admin/messages', label: 'Messages', permission: 'view_messages' },
    { to: '/admin/audit', label: 'Audit Log', permission: 'view_audit_logs' }
  ];

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    administrator: 'bg-purple-100 text-purple-700',
    moder: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">VedZeb Admin</h1>
              <span className={`text-xs px-2 py-1 rounded ${roleColors[admin?.role] || 'bg-gray-100 text-gray-700'}`}>
                {admin?.role}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {admin?.username}
              </span>
              <button
                onClick={adminLogout}
                className="text-sm text-gray-300 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              hasPermission(item.permission) && (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
