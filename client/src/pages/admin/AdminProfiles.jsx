import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { Button, Card, Loading, Input } from '../../components/common';

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /%3E%3C/svg%3E';

const PROFILE_TYPES = {
  searching_sibling: 'Searching Sibling',
  searching_child: 'Searching Child',
  searching_parent: 'Searching Parent',
  searching_relative: 'Searching Relative'
};

export default function AdminProfiles() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAdmin();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-profiles', page, search, typeFilter, activeFilter],
    queryFn: () => adminApi.getProfiles({
      page,
      limit: 20,
      search,
      type: typeFilter || undefined,
      active: activeFilter || undefined
    }),
    select: (response) => response.data
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-profiles']);
      setSelectedProfile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteProfile(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-profiles'])
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profiles Management</h2>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Body>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Search"
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                {Object.entries(PROFILE_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <Button type="submit">Search</Button>
          </form>
        </Card.Body>
      </Card>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.profiles?.map((profile) => {
          const photo = profile.photos?.[0];
          return (
            <Card key={profile.id}>
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={photo?.url || defaultImage}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = defaultImage; }}
                />
                {profile.user?.isBanned && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Owner Banned
                  </div>
                )}
              </div>
              <Card.Body>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {PROFILE_TYPES[profile.type] || profile.type}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    profile.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-500 space-y-1">
                  {profile.birthYear && (
                    <p>Birth Year: {profile.birthYear}</p>
                  )}
                  {profile.birthPlace && (
                    <p>Birth Place: {profile.birthPlace}</p>
                  )}
                  {profile.region && (
                    <p>Region: {profile.region}</p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(profile.createdAt).toLocaleDateString()}
                </p>

                <div className="flex justify-end gap-2 mt-4">
                  {hasPermission('edit_profile') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      Edit
                    </Button>
                  )}
                  <a
                    href={`/profile/${profile.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </a>
                  {hasPermission('delete_profile') && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this profile?')) {
                          deleteMutation.mutate(profile.id);
                        }
                      }}
                      loading={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {data?.profiles?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No profiles found
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
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

      {/* Edit Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      label="First Name"
                      value={selectedProfile.firstName}
                      onChange={(e) => setSelectedProfile(p => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Last Name"
                      value={selectedProfile.lastName || ''}
                      onChange={(e) => setSelectedProfile(p => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={selectedProfile.type}
                    onChange={(e) => setSelectedProfile(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.entries(PROFILE_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Birth Place"
                  value={selectedProfile.birthPlace || ''}
                  onChange={(e) => setSelectedProfile(p => ({ ...p, birthPlace: e.target.value }))}
                />

                <Input
                  label="Region"
                  value={selectedProfile.region || ''}
                  onChange={(e) => setSelectedProfile(p => ({ ...p, region: e.target.value }))}
                />

                <Input
                  label="Birth Year"
                  type="number"
                  value={selectedProfile.birthYear || ''}
                  onChange={(e) => setSelectedProfile(p => ({ ...p, birthYear: parseInt(e.target.value) || null }))}
                />

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProfile.isActive}
                      onChange={(e) => setSelectedProfile(p => ({ ...p, isActive: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedProfile(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateMutation.mutate({
                    id: selectedProfile.id,
                    data: {
                      firstName: selectedProfile.firstName,
                      lastName: selectedProfile.lastName,
                      type: selectedProfile.type,
                      birthPlace: selectedProfile.birthPlace,
                      region: selectedProfile.region,
                      birthYear: selectedProfile.birthYear,
                      isActive: selectedProfile.isActive
                    }
                  })}
                  loading={updateMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
