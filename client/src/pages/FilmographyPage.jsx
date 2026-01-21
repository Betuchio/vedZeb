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
    },
    {
      id: 2,
      title: {
        ka: 'დაკარგული ტყუპი, დამარხული ჩემოდანი და საქართველოს "მოპარული" ბავშვების ძიება',
        en: "The missing 'twin', the buried suitcase, and the hunt to find Georgia's 'stolen' children",
        ru: 'Пропавший близнец, зарытый чемодан и поиск «украденных» детей Грузии'
      },
      year: 2025,
      description: {
        ka: 'ABC News-ის დოკუმენტური ფილმი საქართველოში მოპარული ბავშვების შესახებ - ოჯახები ეძებენ დაკარგულ შვილებს.',
        en: "ABC News documentary about Georgia's stolen children - families searching for their lost children.",
        ru: 'Документальный фильм ABC News об украденных детях Грузии — семьи ищут своих потерянных детей.'
      },
      platform: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=aqJGBRyjt6Y'
    },
    {
      id: 3,
      title: {
        ka: 'ბრძოლა საქართველოს მოპარული ბავშვების მოსაძებნად',
        en: "The fight to find Georgia's stolen babies after adoption scandal",
        ru: 'Борьба за поиск украденных детей Грузии после скандала с усыновлением'
      },
      year: 2024,
      description: {
        ka: 'ABC Australia-ს სტატია საქართველოში ათწლეულების განმავლობაში მიმდინარე ბავშვების ტრეფიკინგის სკანდალის შესახებ.',
        en: 'ABC Australia article about the decades-long baby trafficking scandal in Georgia, where mothers were told their babies died.',
        ru: 'Статья ABC Australia о многолетнем скандале с торговлей детьми в Грузии, где матерям говорили, что их дети умерли.'
      },
      platform: 'abc',
      videoUrl: 'https://www.abc.net.au/news/2024-03-02/the-fight-to-find-georgias-stolen-babies-after-adoption-scandal/103514808'
    },
    {
      id: 4,
      title: {
        ka: 'საქართველოს ბავშვები - მკვდრად გამოცხადებულები და გაყიდულები',
        en: "Georgia's Children - Declared Dead and Then Sold",
        ru: 'Дети Грузии - объявленные мёртвыми и проданные'
      },
      year: 2024,
      description: {
        ka: 'ARTE-ს დოკუმენტური ფილმი საქართველოში მოპარული ბავშვების შესახებ - როგორ აცხადებდნენ ახალშობილებს მკვდრად და ყიდდნენ.',
        en: 'ARTE documentary about stolen children in Georgia - how newborns were declared dead and sold.',
        ru: 'Документальный фильм ARTE об украденных детях в Грузии - как новорождённых объявляли мёртвыми и продавали.'
      },
      platform: 'arte',
      videoUrl: 'https://www.arte.tv/de/videos/120879-010-A/re-georgiens-kinder-fuer-tot-erklaert-und-dann-verkauft/'
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
                        : film.platform === 'youtube'
                        ? 'bg-gradient-to-br from-red-600 to-red-500'
                        : film.platform === 'abc'
                        ? 'bg-gradient-to-br from-blue-800 to-blue-600'
                        : film.platform === 'arte'
                        ? 'bg-gradient-to-br from-orange-600 to-orange-500'
                        : 'bg-gradient-to-br from-gray-700 to-gray-600'
                    }`}>
                      {film.platform === 'hbo' ? (
                        <span className="text-white text-3xl font-bold tracking-wider">HBO</span>
                      ) : film.platform === 'abc' ? (
                        <span className="text-white text-2xl font-bold tracking-wider">ABC</span>
                      ) : film.platform === 'arte' ? (
                        <span className="text-white text-2xl font-bold tracking-wider">ARTE</span>
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
                          : film.platform === 'youtube'
                          ? 'bg-red-100 text-red-700'
                          : film.platform === 'abc'
                          ? 'bg-blue-100 text-blue-700'
                          : film.platform === 'arte'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
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
                          : film.platform === 'youtube'
                          ? 'text-red-600 hover:text-red-700'
                          : film.platform === 'abc'
                          ? 'text-blue-600 hover:text-blue-700'
                          : film.platform === 'arte'
                          ? 'text-orange-600 hover:text-orange-700'
                          : 'text-gray-600 hover:text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {film.platform === 'abc' || film.platform === 'arte' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </>
                        )}
                      </svg>
                      {film.platform === 'hbo'
                        ? t('filmography.watchHBO', 'ნახვა HBO Max-ზე')
                        : film.platform === 'abc'
                        ? t('filmography.watchABC', 'წაიკითხე ABC-ზე')
                        : film.platform === 'arte'
                        ? t('filmography.watchARTE', 'ნახვა ARTE-ზე')
                        : t('filmography.watch', 'ნახვა YouTube-ზე')
                      }
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
