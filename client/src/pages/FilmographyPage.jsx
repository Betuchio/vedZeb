import { useTranslation } from 'react-i18next';
import { Card } from '../components/common';

export default function FilmographyPage() {
  const { t } = useTranslation();

  const films = [
    {
      id: 1,
      title: 'დაკარგული სულები',
      titleEn: 'Lost Souls',
      year: 2023,
      description: 'დოკუმენტური ფილმი გაშვილებული ბავშვების ძიების შესახებ',
      descriptionEn: 'Documentary about searching for adopted children',
      thumbnail: '/films/lost-souls.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=example1'
    },
    {
      id: 2,
      title: 'ოჯახის ძიებაში',
      titleEn: 'In Search of Family',
      year: 2022,
      description: 'ისტორიები ადამიანების შესახებ, რომლებიც თავიანთ ბიოლოგიურ ოჯახს ეძებენ',
      descriptionEn: 'Stories of people searching for their biological families',
      thumbnail: '/films/family-search.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=example2'
    }
  ];

  return (
    <div className="container-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('nav.filmography')}</h1>
        <p className="text-gray-600 mb-8">
          {t('filmography.description', 'ფილმები და დოკუმენტური მასალები დაკარგული ოჯახის წევრების ძიების შესახებ')}
        </p>

        <div className="space-y-6">
          {films.map((film) => (
            <Card key={film.id}>
              <Card.Body>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-full md:w-48 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{film.title}</h3>
                        <p className="text-sm text-gray-500">{film.titleEn}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                        {film.year}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-600">{film.description}</p>
                    <a
                      href={film.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      {t('filmography.watch', 'ნახვა YouTube-ზე')}
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
