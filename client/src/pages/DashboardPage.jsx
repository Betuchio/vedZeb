import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi, contactsApi, alertsApi } from '../services/api';
import { Button, Card, Loading, Modal } from '../components/common';

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /%3E%3C/svg%3E';

export default function DashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profiles');
  const [requestTab, setRequestTab] = useState('received');

  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['my-profiles'],
    queryFn: () => profilesApi.getMy(),
    select: (response) => response.data.profiles
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['contact-requests'],
    queryFn: () => contactsApi.getAll(),
    select: (response) => response.data
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAll(),
    select: (response) => response.data.alerts
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }) => contactsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['contact-requests'])
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => alertsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const tabs = [
    { id: 'profiles', label: t('dashboard.myProfiles') },
    { id: 'requests', label: t('dashboard.contactRequests') },
    { id: 'alerts', label: t('dashboard.searchAlerts') }
  ];

  return (
    <div className="container-page">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard.title')}</h1>

      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'profiles' && (
        <div>
          {profilesLoading ? (
            <Loading className="py-12" />
          ) : profilesData?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profilesData.map((profile) => {
                const photo = profile.photos?.[0];
                return (
                  <Card key={profile.id}>
                    <Link to={`/profile/${profile.id}`}>
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={photo?.url || defaultImage}
                          alt={profile.firstName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = defaultImage; }}
                        />
                      </div>
                    </Link>
                    <Card.Body>
                      <h3 className="font-semibold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t(`search.types.${profile.type}`)}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          profile.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {profile.isActive ? t('dashboard.alerts.active') : t('dashboard.alerts.inactive')}
                        </span>
                        <Link
                          to={`/edit-profile/${profile.id}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {t('common.edit')}
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('dashboard.noProfiles')}</p>
              <Link to="/create-profile">
                <Button>{t('dashboard.createFirst')}</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <div className="flex space-x-4 mb-6">
            <Button
              variant={requestTab === 'received' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setRequestTab('received')}
            >
              {t('dashboard.requests.received')}
            </Button>
            <Button
              variant={requestTab === 'sent' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setRequestTab('sent')}
            >
              {t('dashboard.requests.sent')}
            </Button>
          </div>

          {requestsLoading ? (
            <Loading className="py-12" />
          ) : (
            <div className="space-y-4">
              {(requestTab === 'received' ? requestsData?.received : requestsData?.sent)?.length > 0 ? (
                (requestTab === 'received' ? requestsData.received : requestsData.sent).map((request) => (
                  <Card key={request.id}>
                    <Card.Body className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {requestTab === 'received'
                            ? `${t('dashboard.requests.received')}: ${request.fromUser?.phone}`
                            : `${t('dashboard.requests.sent')}: ${request.toProfile?.firstName}`}
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-500 mt-1">{request.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {t(`dashboard.requests.${request.status}`)}
                        </span>

                        {requestTab === 'received' && request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateRequestMutation.mutate({ id: request.id, status: 'accepted' })}
                              loading={updateRequestMutation.isPending}
                            >
                              {t('dashboard.requests.accept')}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateRequestMutation.mutate({ id: request.id, status: 'rejected' })}
                              loading={updateRequestMutation.isPending}
                            >
                              {t('dashboard.requests.reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">{t('search.noResults')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div>
          {alertsLoading ? (
            <Loading className="py-12" />
          ) : alertsData?.length > 0 ? (
            <div className="space-y-4">
              {alertsData.map((alert) => (
                <Card key={alert.id}>
                  <Card.Body className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {Object.entries(alert.filters || {}).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {value}
                          </span>
                        ))}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alert.isActive ? t('dashboard.alerts.active') : t('dashboard.alerts.inactive')}
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        loading={deleteAlertMutation.isPending}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('dashboard.alerts.noAlerts')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
