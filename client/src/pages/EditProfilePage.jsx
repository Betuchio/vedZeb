import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../services/api';
import { Button, Input, Select, Textarea, Card, Loading } from '../components/common';

const REGIONS = [
  'tbilisi', 'adjara', 'guria', 'imereti', 'kakheti',
  'kvemoKartli', 'mtsketaMtianeti', 'rachaLechkhumiKvemoSvaneti',
  'samegrelo', 'samtskheJavakheti', 'shidaKartli', 'abkhazia',
  'southOssetia', 'other'
];

export default function EditProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => profilesApi.getOne(id),
    select: (response) => response.data
  });

  useEffect(() => {
    if (data?.profile) {
      const p = data.profile;
      setFormData({
        type: p.type,
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        birthYear: p.birthYear?.toString() || '',
        birthDateApproximate: p.birthDateApproximate || false,
        birthPlace: p.birthPlace || '',
        lastKnownLocation: p.lastKnownLocation || '',
        region: p.region || '',
        gender: p.gender || 'unknown',
        story: p.story || '',
        biologicalMotherInfo: typeof p.biologicalMotherInfo === 'string' ? p.biologicalMotherInfo : '',
        biologicalFatherInfo: typeof p.biologicalFatherInfo === 'string' ? p.biologicalFatherInfo : '',
        medicalHistory: p.medicalHistory || '',
        isActive: p.isActive
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updateData = {
        ...formData,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        biologicalMotherInfo: formData.biologicalMotherInfo || null,
        biologicalFatherInfo: formData.biologicalFatherInfo || null
      };

      await profilesApi.update(id, updateData);

      for (const photo of newPhotos) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('photo', photo);
        await profilesApi.uploadPhoto(id, formDataPhoto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', id]);
      navigate(`/profile/${id}`);
    }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => profilesApi.deletePhoto(id, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', id]);
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    const existingCount = data?.profile?.photos?.length || 0;
    const maxNew = 5 - existingCount - newPhotos.length;
    setNewPhotos(prev => [...prev, ...validFiles].slice(0, maxNew));
  };

  if (isLoading || !formData) {
    return <Loading className="py-20" size="lg" />;
  }

  if (!data?.isOwner) {
    navigate('/dashboard');
    return null;
  }

  const typeOptions = [
    { value: 'searching_sibling', label: t('search.types.searching_sibling') },
    { value: 'searching_child', label: t('search.types.searching_child') },
    { value: 'searching_parent', label: t('search.types.searching_parent') },
    { value: 'searching_relative', label: t('search.types.searching_relative') }
  ];

  const genderOptions = [
    { value: 'unknown', label: t('search.genders.unknown') },
    { value: 'male', label: t('search.genders.male') },
    { value: 'female', label: t('search.genders.female') }
  ];

  const regionOptions = [
    { value: '', label: '-' },
    ...REGIONS.map(r => ({ value: r, label: t(`regions.${r}`) }))
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: '', label: '-' },
    ...Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i)
    }))
  ];

  const photos = data.profile.photos || [];
  const totalPhotos = photos.length + newPhotos.length;

  return (
    <div className="container-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('profile.edit.title')}
        </h1>

        <Card>
          <Card.Body className="p-6">
            {updateMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {updateMutation.error.response?.data?.error || t('common.error')}
              </div>
            )}

            <div className="space-y-4">
              <Select
                label={t('profile.create.typeLabel')}
                options={typeOptions}
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              />

              <Input
                label={t('profile.create.firstName') + ' *'}
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />

              <Input
                label={t('profile.create.lastName')}
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />

              <Select
                label={t('profile.create.gender')}
                options={genderOptions}
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('profile.create.birthYear')}
                  options={yearOptions}
                  value={formData.birthYear}
                  onChange={(e) => handleChange('birthYear', e.target.value)}
                />

                <div className="flex items-end pb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.birthDateApproximate}
                      onChange={(e) => handleChange('birthDateApproximate', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {t('profile.create.approximate')}
                    </span>
                  </label>
                </div>
              </div>

              <Input
                label={t('profile.create.birthPlace')}
                value={formData.birthPlace}
                onChange={(e) => handleChange('birthPlace', e.target.value)}
              />

              <Select
                label={t('profile.create.region')}
                options={regionOptions}
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
              />

              <Input
                label={t('profile.view.lastKnown')}
                value={formData.lastKnownLocation}
                onChange={(e) => handleChange('lastKnownLocation', e.target.value)}
              />

              <Textarea
                label={t('profile.create.story')}
                value={formData.story}
                onChange={(e) => handleChange('story', e.target.value)}
                rows={4}
              />

              <Textarea
                label={t('profile.create.motherInfo')}
                value={formData.biologicalMotherInfo}
                onChange={(e) => handleChange('biologicalMotherInfo', e.target.value)}
                rows={3}
              />

              <Textarea
                label={t('profile.create.fatherInfo')}
                value={formData.biologicalFatherInfo}
                onChange={(e) => handleChange('biologicalFatherInfo', e.target.value)}
                rows={3}
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {t('dashboard.alerts.active')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.create.uploadPhotos')}
                </label>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => deletePhotoMutation.mutate(photo.id)}
                        disabled={deletePhotoMutation.isPending}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        &times;
                      </button>
                      {photo.isPrimary && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}

                  {newPhotos.map((photo, index) => (
                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewPhotos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {totalPhotos < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <span className="text-gray-400 text-4xl">+</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => navigate(`/profile/${id}`)}
              >
                {t('profile.edit.cancel')}
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                loading={updateMutation.isPending}
              >
                {t('profile.edit.save')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
