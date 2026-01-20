import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '../services/api';
import { Button, Input, Select, Loading } from '../components/common';
import ProfileCard from '../components/profile/ProfileCard';

const REGIONS = [
  'tbilisi', 'adjara', 'guria', 'imereti', 'kakheti',
  'kvemoKartli', 'mtsketaMtianeti', 'rachaLechkhumiKvemoSvaneti',
  'samegrelo', 'samtskheJavakheti', 'shidaKartli', 'abkhazia',
  'southOssetia', 'other'
];

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    region: searchParams.get('region') || '',
    gender: searchParams.get('gender') || '',
    birthYearFrom: searchParams.get('birthYearFrom') || '',
    birthYearTo: searchParams.get('birthYearTo') || ''
  });

  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['profiles', filters, page],
    queryFn: () => profilesApi.getAll({
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      page,
      limit: 12
    }),
    select: (response) => response.data
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key === 'search' ? 'q' : key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      region: '',
      gender: '',
      birthYearFrom: '',
      birthYearTo: ''
    });
    setPage(1);
  };

  const typeOptions = [
    { value: '', label: t('search.types.all') },
    { value: 'searching_sibling', label: t('search.types.searching_sibling') },
    { value: 'searching_child', label: t('search.types.searching_child') },
    { value: 'searching_parent', label: t('search.types.searching_parent') }
  ];

  const genderOptions = [
    { value: '', label: t('search.genders.all') },
    { value: 'male', label: t('search.genders.male') },
    { value: 'female', label: t('search.genders.female') },
    { value: 'unknown', label: t('search.genders.unknown') }
  ];

  const regionOptions = [
    { value: '', label: t('search.genders.all') },
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

  return (
    <div className="container-page">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('search.title')}</h1>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('home.hero.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            {t('search.filters.title')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className={`lg:w-64 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">{t('search.filters.title')}</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:underline"
              >
                {t('search.filters.clear')}
              </button>
            </div>

            <div className="space-y-4">
              <Select
                label={t('search.filters.type')}
                options={typeOptions}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              />

              <Select
                label={t('search.filters.region')}
                options={regionOptions}
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              />

              <Select
                label={t('search.filters.gender')}
                options={genderOptions}
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('search.filters.birthYear')}
                </label>
                <div className="flex gap-2 items-center">
                  <Select
                    options={yearOptions}
                    value={filters.birthYearFrom}
                    onChange={(e) => handleFilterChange('birthYearFrom', e.target.value)}
                    placeholder={t('search.filters.from')}
                  />
                  <span className="text-gray-400">-</span>
                  <Select
                    options={yearOptions}
                    value={filters.birthYearTo}
                    onChange={(e) => handleFilterChange('birthYearTo', e.target.value)}
                    placeholder={t('search.filters.to')}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {isLoading ? (
            <Loading className="py-12" />
          ) : data?.profiles?.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {data.pagination.total} {t('search.results')}
              </div>

              <div className="relative">
                {isFetching && !isLoading && (
                  <div className="absolute inset-0 bg-white/50 z-10" />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.profiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    &larr;
                  </Button>

                  {Array.from({ length: data.pagination.totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? 'primary' : 'secondary'}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  )).slice(Math.max(0, page - 3), Math.min(data.pagination.totalPages, page + 2))}

                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    &rarr;
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">{t('search.noResults')}</p>
              <p className="text-sm text-gray-400">{t('search.tryDifferent')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
