import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/adminApi';
import { useAdmin } from '../../context/AdminContext';
import { Button, Card, Loading, Input } from '../../components/common';

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /%3E%3C/svg%3E';

export default function AdminProfiles() {
  const { t } = useTranslation();
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
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      setSelectedProfile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteProfile(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-profiles'] })
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.profiles.title')}</h2>

      {/* Filters */}
      <Card className="mb-6">
        <Card.Body>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                label={t('admin.profiles.search')}
                placeholder={t('admin.profiles.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.profiles.type')}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.profiles.allTypes')}</option>
                <option value="searching_sibling">{t('admin.profiles.types.searching_sibling')}</option>
                <option value="searching_child">{t('admin.profiles.types.searching_child')}</option>
                <option value="searching_parent">{t('admin.profiles.types.searching_parent')}</option>
                <option value="searching_relative">{t('admin.profiles.types.searching_relative')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.profiles.status')}
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('admin.profiles.all')}</option>
                <option value="true">{t('admin.profiles.active')}</option>
                <option value="false">{t('admin.profiles.inactive')}</option>
              </select>
            </div>

            <Button type="submit">{t('admin.common.search')}</Button>
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
                    {t('admin.profiles.ownerBanned')}
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
                      {t(`admin.profiles.types.${profile.type}`) || profile.type}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    profile.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {profile.isActive ? t('admin.profiles.active') : t('admin.profiles.inactive')}
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-500 space-y-1">
                  {profile.birthYear && (
                    <p>{t('admin.profiles.birthYear')}: {profile.birthYear}</p>
                  )}
                  {profile.birthPlace && (
                    <p>{t('admin.profiles.birthPlace')}: {profile.birthPlace}</p>
                  )}
                  {profile.region && (
                    <p>{t('admin.profiles.region')}: {profile.region}</p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {t('admin.profiles.created')}: {new Date(profile.createdAt).toLocaleDateString('ka-GE')}
                </p>

                <div className="flex justify-end gap-2 mt-4">
                  {hasPermission('edit_profile') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      {t('admin.profiles.edit')}
                    </Button>
                  )}
                  <a
                    href={`/profile/${profile.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="secondary">
                      {t('admin.profiles.view')}
                    </Button>
                  </a>
                  {hasPermission('delete_profile') && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm(t('admin.profiles.confirmDelete'))) {
                          deleteMutation.mutate(profile.id);
                        }
                      }}
                      loading={deleteMutation.isPending}
                    >
                      {t('admin.profiles.delete')}
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
          {t('admin.profiles.noProfiles')}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {t('admin.users.page')} {data.pagination.page} {t('admin.users.of')} {data.pagination.pages} ({t('admin.users.total')}: {data.pagination.total})
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              {t('admin.users.previous')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              {t('admin.users.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('admin.profiles.editProfile')}</h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      label={t('admin.profiles.firstName')}
                      value={selectedProfile.firstName}
                      onChange={(e) => setSelectedProfile(p => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label={t('admin.profiles.lastName')}
                      value={selectedProfile.lastName || ''}
                      onChange={(e) => setSelectedProfile(p => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.profiles.type')}
                  </label>
                  <select
                    value={selectedProfile.type}
                    onChange={(e) => setSelectedProfile(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="searching_sibling">{t('admin.profiles.types.searching_sibling')}</option>
                    <option value="searching_child">{t('admin.profiles.types.searching_child')}</option>
                    <option value="searching_parent">{t('admin.profiles.types.searching_parent')}</option>
                    <option value="searching_relative">{t('admin.profiles.types.searching_relative')}</option>
                  </select>
                </div>

                <Input
                  label={t('admin.profiles.birthPlace')}
                  value={selectedProfile.birthPlace || ''}
                  onChange={(e) => setSelectedProfile(p => ({ ...p, birthPlace: e.target.value }))}
                />

                <Input
                  label={t('admin.profiles.region')}
                  value={selectedProfile.region || ''}
                  onChange={(e) => setSelectedProfile(p => ({ ...p, region: e.target.value }))}
                />

                <Input
                  label={t('admin.profiles.birthYear')}
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
                    <span className="text-sm text-gray-700">{t('admin.profiles.active')}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedProfile(null)}
                >
                  {t('admin.common.cancel')}
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
                  {t('admin.common.save')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
