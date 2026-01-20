import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { profilesApi } from '../services/api';
import { Button, Input, Select, Textarea, Card } from '../components/common';

const REGIONS = [
  'tbilisi', 'adjara', 'guria', 'imereti', 'kakheti',
  'kvemoKartli', 'mtsketaMtianeti', 'rachaLechkhumiKvemoSvaneti',
  'samegrelo', 'samtskheJavakheti', 'shidaKartli', 'abkhazia',
  'southOssetia', 'other'
];

export default function CreateProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    type: 'searching_sibling',
    firstName: '',
    lastName: '',
    birthYear: '',
    birthDateApproximate: true,
    birthPlace: '',
    lastKnownLocation: '',
    region: '',
    gender: 'unknown',
    story: '',
    biologicalMotherInfo: '',
    biologicalFatherInfo: '',
    medicalHistory: ''
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const profileData = {
        ...formData,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        biologicalMotherInfo: formData.biologicalMotherInfo || null,
        biologicalFatherInfo: formData.biologicalFatherInfo || null
      };

      const response = await profilesApi.create(profileData);
      const profileId = response.data.profile.id;

      for (const photo of photos) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('photo', photo);
        await profilesApi.uploadPhoto(profileId, formDataPhoto);
      }

      return profileId;
    },
    onSuccess: (profileId) => {
      navigate(`/profile/${profileId}`);
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

    setPhotos(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const typeOptions = [
    { value: 'searching_sibling', label: t('search.types.searching_sibling') },
    { value: 'searching_child', label: t('search.types.searching_child') },
    { value: 'searching_parent', label: t('search.types.searching_parent') }
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

  const steps = [
    t('profile.create.step1'),
    t('profile.create.step2'),
    t('profile.create.step3'),
    t('profile.create.step4')
  ];

  const canProceed = () => {
    if (step === 1) {
      return formData.type && formData.firstName;
    }
    return true;
  };

  return (
    <div className="container-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t('profile.create.title')}
        </h1>

        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((label, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${index < steps.length - 1 ? 'relative' : ''}`}
              >
                <div
                  className={`
                    w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium
                    ${step > index + 1 ? 'bg-green-500 text-white' : ''}
                    ${step === index + 1 ? 'bg-primary-600 text-white' : ''}
                    ${step < index + 1 ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-xs text-gray-500 hidden sm:block">{label}</div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <Card.Body className="p-6">
            {createMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {createMutation.error.response?.data?.error || t('common.error')}
              </div>
            )}

            {step === 1 && (
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
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
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
                  helperText={t('profile.create.storyHelp')}
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

                <Textarea
                  label={t('profile.create.medicalHistory')}
                  value={formData.medicalHistory}
                  onChange={(e) => handleChange('medicalHistory', e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.create.uploadPhotos')}
                </label>
                <p className="text-sm text-gray-500 mb-4">{t('profile.create.uploadHelp')}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
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
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t('profile.create.step4')}</h3>

                <div className="space-y-2 text-sm">
                  <p><strong>{t('profile.create.typeLabel')}:</strong> {t(`search.types.${formData.type}`)}</p>
                  <p><strong>{t('profile.create.firstName')}:</strong> {formData.firstName} {formData.lastName}</p>
                  {formData.birthYear && (
                    <p><strong>{t('profile.create.birthYear')}:</strong> {formData.birthYear} {formData.birthDateApproximate && '(~)'}</p>
                  )}
                  {formData.region && (
                    <p><strong>{t('profile.create.region')}:</strong> {t(`regions.${formData.region}`)}</p>
                  )}
                  {formData.birthPlace && (
                    <p><strong>{t('profile.create.birthPlace')}:</strong> {formData.birthPlace}</p>
                  )}
                  {formData.story && (
                    <p><strong>{t('profile.create.story')}:</strong> {formData.story}</p>
                  )}
                  <p><strong>{t('profile.create.uploadPhotos')}:</strong> {photos.length}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
              >
                {t('profile.create.back')}
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                >
                  {t('profile.create.next')}
                </Button>
              ) : (
                <Button
                  onClick={() => createMutation.mutate()}
                  loading={createMutation.isPending}
                >
                  {t('profile.create.submit')}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
