import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { Button, Card, Loading, Input } from '../../components/common';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { hasPermission, admin } = useAdmin();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('user');
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleData, setRoleData] = useState({ role: 'user', username: '', password: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminApi.getUsers({ page, limit: 20, search, role: roleFilter }),
    select: (response) => response.data
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setSelectedUser(null);
      setBanReason('');
    }
  });

  const unbanMutation = useMutation({
    mutationFn: (id) => adminApi.unbanUser(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role, username, password }) =>
      adminApi.assignRole(id, role, username, password),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setShowRoleModal(false);
      setRoleData({ role: 'user', username: '', password: '' });
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Users Management</h2>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Body>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Search"
                placeholder="Search by phone or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Filter
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="user">Users</option>
                <option value="moder">Moderators</option>
                <option value="administrator">Administrators</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button type="submit">Search</Button>
          </form>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profiles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{user.phone}</td>
                  <td className="px-4 py-3 text-sm">{user.username || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'administrator' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'moder' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user._count?.profiles || 0}</td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                        Banned
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Ban/Unban buttons */}
                      {hasPermission('ban_user') && user.role === 'user' && (
                        user.isBanned ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => unbanMutation.mutate(user.id)}
                            loading={unbanMutation.isPending}
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedUser(user)}
                          >
                            Ban
                          </Button>
                        )
                      )}

                      {/* Role assignment - only for admin */}
                      {hasPermission('assign_role') && user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleData({
                              role: user.role,
                              username: user.username || '',
                              password: ''
                            });
                            setShowRoleModal(true);
                          }}
                        >
                          Role
                        </Button>
                      )}

                      {/* Delete button */}
                      {hasPermission('delete_user') && user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          loading={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
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

      {/* Ban Modal */}
      {selectedUser && !showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ban User</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ban user: {selectedUser.phone}
              </p>
              <Input
                label="Ban Reason (optional)"
                placeholder="Enter reason for ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedUser(null);
                    setBanReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => banMutation.mutate({ id: selectedUser.id, reason: banReason })}
                  loading={banMutation.isPending}
                >
                  Ban User
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold mb-4">Assign Role</h3>
              <p className="text-sm text-gray-600 mb-4">
                User: {selectedUser.phone}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={roleData.role}
                  onChange={(e) => setRoleData(d => ({ ...d, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">User</option>
                  <option value="moder">Moderator</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              {roleData.role !== 'user' && (
                <>
                  <Input
                    label="Username"
                    placeholder="Enter username"
                    value={roleData.username}
                    onChange={(e) => setRoleData(d => ({ ...d, username: e.target.value }))}
                    className="mb-4"
                    required
                  />
                  <Input
                    label={selectedUser.password ? 'New Password (optional)' : 'Password'}
                    type="password"
                    placeholder="Enter password"
                    value={roleData.password}
                    onChange={(e) => setRoleData(d => ({ ...d, password: e.target.value }))}
                    className="mb-4"
                  />
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setRoleData({ role: 'user', username: '', password: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => roleMutation.mutate({
                    id: selectedUser.id,
                    ...roleData
                  })}
                  loading={roleMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
