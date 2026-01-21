import { useTranslation } from 'react-i18next';
import { Card } from '../components/common';

export default function FilmographyPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const films = [
    {
      id: 1,
      title: {
        ka: 'მოპარული ბავშვები',
        en: 'Stolen Children',
        ru: 'Украденные дети'
      },
      year: 2025,
      description: {
        ka: 'დოკუმენტური ფილმი, რომელიც ამხელს ტრეფიკინგის სქემას - ათიათასობით ახალშობილი განაცალკევეს მათი ოჯახებისგან.',
        en: 'Documentary exposing a trafficking scheme that separated tens of thousands of newborns from their families.',
        ru: 'Документальный фильм, разоблачающий схему торговли людьми — десятки тысяч новорождённых были разлучены со своими семьями.'
      },
      directors: 'Martyna Wojciechowska, Jowita Baraniecka',
      platform: 'hbo',
      videoUrl: 'https://www.hbomax.com/ge/en/movies/stolen-children/5be67ea5-d702-403f-93e3-3bfd0422aed6'
    }
  ];

  const getLocalizedText = (textObj) => {
    if (typeof textObj === 'string') return textObj;
    return textObj[currentLang] || textObj.en || textObj.ka || '';
  };

  return (
    <div className="container-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('nav.filmography')}</h1>
        <p className="text-gray-600 mb-8">
          {t('filmography.description', 'ფილმები და დოკუმენტური მასალები დაკარგული ოჯახის წევრების ძიების შესახებ')}
        </p>

        <div className="space-y-6">
          {films.map((film) => (
            <Card key={film.id} className="overflow-hidden">
              <Card.Body className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-shrink-0">
                    <div className={`w-full md:w-56 h-40 md:h-full flex items-center justify-center ${
                      film.platform === 'hbo'
                        ? 'bg-gradient-to-br from-purple-900 to-purple-700'
                        : 'bg-gradient-to-br from-red-600 to-red-500'
                    }`}>
                      {film.platform === 'hbo' ? (
                        <span className="text-white text-3xl font-bold tracking-wider">HBO</span>
                      ) : (
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{getLocalizedText(film.title)}</h3>
                        {currentLang !== 'en' && <p className="text-sm text-gray-500">{film.title.en}</p>}
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex-shrink-0 ${
                        film.platform === 'hbo'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {film.year}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-600">{getLocalizedText(film.description)}</p>
                    {film.directors && (
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">{t('filmography.directors', 'რეჟისორები')}:</span> {film.directors}
                      </p>
                    )}
                    <a
                      href={film.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 mt-4 font-medium transition-colors ${
                        film.platform === 'hbo'
                          ? 'text-purple-600 hover:text-purple-700'
                          : 'text-red-600 hover:text-red-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {film.platform === 'hbo'
                        ? t('filmography.watchHBO', 'ნახვა HBO Max-ზე')
                        : t('filmography.watch', 'ნახვა YouTube-ზე')
                      }
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {t('filmography.submit', 'გაქვთ ფილმი დასამატებელი?')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('filmography.submitText', 'თუ თქვენ შექმენით ან იცით ფილმი/დოკუმენტური ამ თემაზე, გვაცნობეთ და დავამატებთ სიაში.')}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {t('nav.contact')}
          </a>
        </div>
      </div>
    </div>
  );
}
