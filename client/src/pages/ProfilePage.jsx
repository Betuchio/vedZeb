import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi, contactsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Modal, Textarea, Loading } from '../components/common';

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /%3E%3C/svg%3E';

export default function ProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => profilesApi.getOne(id),
    select: (response) => response.data
  });

  const contactMutation = useMutation({
    mutationFn: () => contactsApi.create(id, contactMessage),
    onSuccess: () => {
      setShowContactModal(false);
      setContactMessage('');
      alert(t('profile.view.contactButton') + ' - Success!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => profilesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      navigate('/dashboard');
    }
  });

  if (isLoading) {
    return <Loading className="py-20" size="lg" />;
  }

  if (error || !data?.profile) {
    return (
      <div className="container-page text-center py-20">
        <p className="text-gray-500">{t('common.error')}</p>
        <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block">
          {t('nav.search')}
        </Link>
      </div>
    );
  }

  const { profile, isOwner } = data;
  const photos = profile.photos || [];
  const currentPhoto = photos[selectedImage]?.url || defaultImage;

  const typeLabels = {
    searching_sibling: t('search.types.searching_sibling'),
    searching_child: t('search.types.searching_child'),
    searching_parent: t('search.types.searching_parent'),
    searching_relative: t('search.types.searching_relative')
  };

  const genderLabels = {
    male: t('search.genders.male'),
    female: t('search.genders.female'),
    unknown: t('search.genders.unknown')
  };

  return (
    <div className="container-page">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              <img
                src={currentPhoto}
                alt={profile.firstName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                {typeLabels[profile.type]}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {profile.firstName} {profile.lastName}
            </h1>

            <Card className="mb-6">
              <Card.Body className="space-y-3">
                {profile.birthYear && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('profile.view.birthDate')}</span>
                    <span className="font-medium">
                      {profile.birthDate
                        ? new Date(profile.birthDate).toLocaleDateString()
                        : profile.birthYear}
                      {profile.birthDateApproximate && ' (~)'}
                    </span>
                  </div>
                )}

                {profile.birthPlace && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('profile.view.birthPlace')}</span>
                    <span className="font-medium">{profile.birthPlace}</span>
                  </div>
                )}

                {profile.region && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('profile.view.region')}</span>
                    <span className="font-medium">{t(`regions.${profile.region}`) || profile.region}</span>
                  </div>
                )}

                {profile.lastKnownLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('profile.view.lastKnown')}</span>
                    <span className="font-medium">{profile.lastKnownLocation}</span>
                  </div>
                )}

                {profile.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('profile.create.gender')}</span>
                    <span className="font-medium">{genderLabels[profile.gender]}</span>
                  </div>
                )}
              </Card.Body>
            </Card>

            {profile.story && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('profile.view.story')}</h3>
                <p className="text-gray-600 whitespace-pre-line">{profile.story}</p>
              </div>
            )}

            {profile.biologicalMotherInfo && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('profile.view.biologicalMother')}</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {typeof profile.biologicalMotherInfo === 'string'
                    ? profile.biologicalMotherInfo
                    : JSON.stringify(profile.biologicalMotherInfo)}
                </p>
              </div>
            )}

            {profile.biologicalFatherInfo && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('profile.view.biologicalFather')}</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {typeof profile.biologicalFatherInfo === 'string'
                    ? profile.biologicalFatherInfo
                    : JSON.stringify(profile.biologicalFatherInfo)}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <Link to={`/edit-profile/${profile.id}`}>
                    <Button>{t('profile.view.editButton')}</Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    {t('profile.view.deleteButton')}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/auth');
                    } else {
                      setShowContactModal(true);
                    }
                  }}
                >
                  {t('profile.view.contactButton')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={t('profile.view.contactButton')}
      >
        <Textarea
          label={t('contact.form.message')}
          value={contactMessage}
          onChange={(e) => setContactMessage(e.target.value)}
          rows={4}
          className="mb-4"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => contactMutation.mutate()}
            loading={contactMutation.isPending}
          >
            {t('contact.form.send')}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('common.confirm')}
      >
        <p className="text-gray-600 mb-6">
          {t('common.delete')}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            loading={deleteMutation.isPending}
          >
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
