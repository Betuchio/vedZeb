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

const MATERNITY_HOSPITALS = [
  'maternity_1', 'maternity_2', 'maternity_3', 'maternity_4', 'maternity_5',
  'chachava', 'gudushauri', 'other'
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
    birthMonth: '',
    birthDay: '',
    birthDateApproximate: true,
    birthPlace: '',
    maternityHospital: '',
    lastKnownLocation: '',
    region: '',
    gender: 'unknown',
    story: '',
    biologicalMotherInfo: '',
    biologicalFatherInfo: '',
    medicalHistory: '',
    myBirthYear: '',
    myBirthMonth: '',
    myBirthDay: ''
  });

  // Get context-aware label based on profile type
  const getLabel = (field) => {
    const contextLabel = t(`profile.create.contextLabels.${formData.type}.${field}`, { defaultValue: '' });
    if (contextLabel) return contextLabel;
    return t(`profile.create.${field}`);
  };

  const [validationError, setValidationError] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        throw new Error(t('profile.create.firstName') + ' ' + t('common.required'));
      }

      // Build profile data with only non-empty optional fields
      const profileData = {
        type: formData.type,
        firstName: formData.firstName.trim(),
        gender: formData.gender,
        birthDateApproximate: formData.birthDateApproximate
      };

      // Add optional string fields only if not empty
      if (formData.lastName?.trim()) profileData.lastName = formData.lastName.trim();
      if (formData.birthPlace?.trim()) profileData.birthPlace = formData.birthPlace.trim();
      if (formData.lastKnownLocation?.trim()) profileData.lastKnownLocation = formData.lastKnownLocation.trim();
      if (formData.region) profileData.region = formData.region;
      if (formData.story?.trim()) profileData.story = formData.story.trim();
      if (formData.biologicalMotherInfo?.trim()) profileData.biologicalMotherInfo = formData.biologicalMotherInfo.trim();
      if (formData.biologicalFatherInfo?.trim()) profileData.biologicalFatherInfo = formData.biologicalFatherInfo.trim();
      if (formData.medicalHistory?.trim()) profileData.medicalHistory = formData.medicalHistory.trim();
      if (formData.maternityHospital) profileData.maternityHospital = formData.maternityHospital;

      // Add optional integer fields only if not empty
      if (formData.birthYear) profileData.birthYear = parseInt(formData.birthYear);
      if (formData.birthMonth) profileData.birthMonth = parseInt(formData.birthMonth);
      if (formData.birthDay) profileData.birthDay = parseInt(formData.birthDay);
      if (formData.myBirthYear) profileData.myBirthYear = parseInt(formData.myBirthYear);
      if (formData.myBirthMonth) profileData.myBirthMonth = parseInt(formData.myBirthMonth);
      if (formData.myBirthDay) profileData.myBirthDay = parseInt(formData.myBirthDay);

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
      setValidationError('');
      navigate(`/profile/${profileId}`);
    },
    onError: (error) => {
      setValidationError(error.response?.data?.error || error.message || t('common.error'));
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

  const monthOptions = [
    { value: '', label: '-' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1).padStart(2, '0')
    }))
  ];

  const dayOptions = [
    { value: '', label: '-' },
    ...Array.from({ length: 31 }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1).padStart(2, '0')
    }))
  ];

  const maternityHospitalOptions = [
    { value: '', label: '-' },
    ...MATERNITY_HOSPITALS.map(h => ({ value: h, label: t(`maternityHospitals.${h}`) }))
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
            {(createMutation.error || validationError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {validationError || createMutation.error?.response?.data?.error || t('common.error')}
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
                  label={getLabel('firstName') + ' *'}
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />

                <Input
                  label={getLabel('lastName')}
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />

                <Select
                  label={getLabel('gender')}
                  options={genderOptions}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getLabel('birthYear')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      options={yearOptions}
                      value={formData.birthYear}
                      onChange={(e) => handleChange('birthYear', e.target.value)}
                      placeholder={t('profile.create.birthYear')}
                    />
                    <Select
                      options={monthOptions}
                      value={formData.birthMonth}
                      onChange={(e) => handleChange('birthMonth', e.target.value)}
                      placeholder={t('profile.create.birthMonth')}
                    />
                    <Select
                      options={dayOptions}
                      value={formData.birthDay}
                      onChange={(e) => handleChange('birthDay', e.target.value)}
                      placeholder={t('profile.create.birthDay')}
                    />
                  </div>
                  <label className="flex items-center mt-2">
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

                <Select
                  label={getLabel('maternityHospital')}
                  options={maternityHospitalOptions}
                  value={formData.maternityHospital}
                  onChange={(e) => handleChange('maternityHospital', e.target.value)}
                />

                {/* My birth date - for people searching for siblings, children, parents, or relatives */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getLabel('myBirthYear')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      options={yearOptions}
                      value={formData.myBirthYear}
                      onChange={(e) => handleChange('myBirthYear', e.target.value)}
                      placeholder={t('profile.create.birthYear')}
                    />
                    <Select
                      options={monthOptions}
                      value={formData.myBirthMonth}
                      onChange={(e) => handleChange('myBirthMonth', e.target.value)}
                      placeholder={t('profile.create.birthMonth')}
                    />
                    <Select
                      options={dayOptions}
                      value={formData.myBirthDay}
                      onChange={(e) => handleChange('myBirthDay', e.target.value)}
                      placeholder={t('profile.create.birthDay')}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Input
                  label={getLabel('birthPlace')}
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
                  <p><strong>{getLabel('firstName')}:</strong> {formData.firstName} {formData.lastName}</p>
                  {(formData.birthYear || formData.birthMonth || formData.birthDay) && (
                    <p>
                      <strong>{getLabel('birthYear')}:</strong>{' '}
                      {[formData.birthYear, formData.birthMonth?.padStart?.(2, '0') || formData.birthMonth, formData.birthDay?.padStart?.(2, '0') || formData.birthDay].filter(Boolean).join('-')}
                      {formData.birthDateApproximate && ' (~)'}
                    </p>
                  )}
                  {formData.maternityHospital && (
                    <p><strong>{getLabel('maternityHospital')}:</strong> {t(`maternityHospitals.${formData.maternityHospital}`)}</p>
                  )}
                  {formData.region && (
                    <p><strong>{t('profile.create.region')}:</strong> {t(`regions.${formData.region}`)}</p>
                  )}
                  {formData.birthPlace && (
                    <p><strong>{getLabel('birthPlace')}:</strong> {formData.birthPlace}</p>
                  )}
                  {(formData.myBirthYear || formData.myBirthMonth || formData.myBirthDay) && (
                    <p>
                      <strong>{getLabel('myBirthYear')}:</strong>{' '}
                      {[formData.myBirthYear, formData.myBirthMonth?.padStart?.(2, '0') || formData.myBirthMonth, formData.myBirthDay?.padStart?.(2, '0') || formData.myBirthDay].filter(Boolean).join('-')}
                    </p>
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
