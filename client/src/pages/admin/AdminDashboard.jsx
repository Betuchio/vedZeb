import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { Card, Loading } from '../../components/common';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    select: (response) => response.data
  });

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load statistics
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'blue', show: stats.totalUsers !== undefined },
    { label: 'Total Profiles', value: stats.totalProfiles, color: 'green', show: true },
    { label: 'Active Profiles', value: stats.activeProfiles, color: 'emerald', show: true },
    { label: 'Total Messages', value: stats.totalMessages, color: 'purple', show: true },
    { label: 'Contact Requests', value: stats.totalContactRequests, color: 'indigo', show: stats.totalContactRequests !== undefined },
    { label: 'Pending Requests', value: stats.pendingContactRequests, color: 'yellow', show: stats.pendingContactRequests !== undefined },
    { label: 'Banned Users', value: stats.bannedUsers, color: 'red', show: stats.bannedUsers !== undefined },
    { label: 'New Users (7d)', value: stats.recentUsers, color: 'teal', show: stats.recentUsers !== undefined },
    { label: 'New Profiles (7d)', value: stats.recentProfiles, color: 'cyan', show: true }
  ].filter(s => s.show);

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    teal: 'bg-teal-50 border-teal-200 text-teal-600',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className={`border ${colorClasses[stat.color].split(' ').slice(0, 2).join(' ')}`}>
            <Card.Body className="p-4">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${colorClasses[stat.color].split(' ').slice(2).join(' ')}`}>
                {stat.value?.toLocaleString() || 0}
              </p>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Body>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/admin/users"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Manage Users</span>
                <p className="text-sm text-gray-500">View, ban, or delete users</p>
              </a>
              <a
                href="/admin/profiles"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Moderate Profiles</span>
                <p className="text-sm text-gray-500">Review and edit profiles</p>
              </a>
              <a
                href="/admin/audit"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">View Audit Logs</span>
                <p className="text-sm text-gray-500">Track admin actions</p>
              </a>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Server Status</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-600 text-sm">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-600 text-sm">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Update</span>
                <span className="text-gray-500 text-sm">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
