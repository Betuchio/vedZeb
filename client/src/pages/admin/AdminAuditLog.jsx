import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { Button, Card, Loading } from '../../components/common';

const ACTION_LABELS = {
  admin_login: 'Admin Login',
  user_banned: 'User Banned',
  user_unbanned: 'User Unbanned',
  user_deleted: 'User Deleted',
  role_assigned: 'Role Assigned',
  profile_updated: 'Profile Updated',
  profile_deleted: 'Profile Deleted',
  message_deleted: 'Message Deleted',
  password_changed: 'Password Changed'
};

const ACTION_COLORS = {
  admin_login: 'bg-blue-100 text-blue-700',
  user_banned: 'bg-red-100 text-red-700',
  user_unbanned: 'bg-green-100 text-green-700',
  user_deleted: 'bg-red-100 text-red-700',
  role_assigned: 'bg-purple-100 text-purple-700',
  profile_updated: 'bg-yellow-100 text-yellow-700',
  profile_deleted: 'bg-red-100 text-red-700',
  message_deleted: 'bg-orange-100 text-orange-700',
  password_changed: 'bg-gray-100 text-gray-700'
};

export default function AdminAuditLog() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, actionFilter],
    queryFn: () => adminApi.getAuditLogs({
      page,
      limit: 50,
      action: actionFilter || undefined
    }),
    select: (response) => response.data
  });

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h2>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Body>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Filter
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Actions</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {log.admin?.username || 'Unknown'}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        log.admin?.role === 'admin' ? 'bg-red-100 text-red-700' :
                        log.admin?.role === 'administrator' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.admin?.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {log.targetId ? (
                      <span className="font-mono text-xs text-gray-500">
                        {log.targetId.slice(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.details ? (
                      <details className="cursor-pointer">
                        <summary className="text-primary-600 hover:underline">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto max-w-md">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.logs?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No audit logs found
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
