import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { Button, Card, Loading } from '../../components/common';

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAdmin();

  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages', page],
    queryFn: () => adminApi.getMessages({ page, limit: 50 }),
    select: (response) => response.data
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteMessage(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-messages'])
  });

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages Monitoring</h2>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Read</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                {hasPermission('delete_message') && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.messages?.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="max-w-md truncate" title={message.content}>
                      {message.content}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className="font-mono text-xs">{message.senderId.slice(0, 8)}...</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      message.contactRequest?.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : message.contactRequest?.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {message.contactRequest?.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {message.isRead ? (
                      <span className="text-green-600 text-sm">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </td>
                  {hasPermission('delete_message') && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this message?')) {
                            deleteMutation.mutate(message.id);
                          }
                        }}
                        loading={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.messages?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No messages found
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
