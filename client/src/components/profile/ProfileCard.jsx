import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /%3E%3C/svg%3E';

export default function ProfileCard({ profile }) {
  const { t } = useTranslation();

  const primaryPhoto = profile.photos?.find(p => p.isPrimary) || profile.photos?.[0];
  const imageUrl = primaryPhoto?.url || defaultImage;

  const typeLabels = {
    searching_sibling: t('search.types.searching_sibling'),
    searching_child: t('search.types.searching_child'),
    searching_parent: t('search.types.searching_parent')
  };

  const genderLabels = {
    male: t('search.genders.male'),
    female: t('search.genders.female'),
    unknown: t('search.genders.unknown')
  };

  return (
    <Link
      to={`/profile/${profile.id}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={profile.firstName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
            {typeLabels[profile.type]}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {profile.firstName} {profile.lastName}
        </h3>

        <div className="mt-2 space-y-1 text-sm text-gray-500">
          {profile.birthYear && (
            <p>
              <span className="font-medium">{t('profile.create.birthYear')}:</span> {profile.birthYear}
              {profile.birthDateApproximate && ' (~)'}
            </p>
          )}

          {profile.region && (
            <p>
              <span className="font-medium">{t('profile.view.region')}:</span> {t(`regions.${profile.region}`) || profile.region}
            </p>
          )}

          {profile.gender && profile.gender !== 'unknown' && (
            <p>
              <span className="font-medium">{t('profile.create.gender')}:</span> {genderLabels[profile.gender]}
            </p>
          )}
        </div>

        {profile.story && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {profile.story}
          </p>
        )}
      </div>
    </Link>
  );
}
