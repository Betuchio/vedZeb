import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="gradient-bg-subtle min-h-screen">
      <div className="container-page">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t('about.title')}</span>
            </h1>
            <p className="text-xl text-slate-600">{t('about.missionText')}</p>
          </div>

          <div className="space-y-8">
            <div className="card-solid p-8 animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('about.whatIsVedzeb')}</h2>
                  <p className="text-slate-600 leading-relaxed">{t('about.whatIsVedzebText')}</p>
                </div>
              </div>
            </div>

            <div className="card-solid p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('about.howItWorks')}</h2>
                  <ul className="space-y-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <li key={num} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {num}
                        </span>
                        <span className="text-slate-600">{t(`about.howItWorksItems.${num}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-solid p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('about.privacySafety')}</h2>
                  <p className="text-slate-600 leading-relaxed">{t('about.privacySafetyText')}</p>
                </div>
              </div>
            </div>

            <div className="card-solid p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold mb-3">{t('about.mission')}</h2>
              <p className="text-indigo-100 text-lg">{t('about.missionText')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
