import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();

  const Section = ({ title, children, icon, delay = '0s' }) => (
    <div className="card-solid p-6 animate-slide-up" style={{ animationDelay: delay }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="gradient-bg-subtle min-h-screen">
      <div className="container-page">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t('privacy.title')}</span>
            </h1>
          </div>

          <div className="space-y-6">
            <Section
              title={t('privacy.intro')}
              delay="0s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
              <p className="text-slate-600 leading-relaxed">{t('privacy.introText')}</p>
            </Section>

            <Section
              title={t('privacy.infoCollect')}
              delay="0.05s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            >
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{t('privacy.infoCollectItems.phone')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{t('privacy.infoCollectItems.profile')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{t('privacy.infoCollectItems.usage')}</span>
                </li>
              </ul>
            </Section>

            <Section
              title={t('privacy.howUseInfo')}
              delay="0.1s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            >
              <ul className="space-y-2 text-slate-600">
                {[1, 2, 3, 4, 5].map((num) => (
                  <li key={num} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>{t(`privacy.howUseInfoItems.${num}`)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section
              title={t('privacy.infoSharing')}
              delay="0.15s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
            >
              <p className="text-slate-600 leading-relaxed">{t('privacy.infoSharingText')}</p>
            </Section>

            <Section
              title={t('privacy.dataSecurity')}
              delay="0.2s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            >
              <p className="text-slate-600 leading-relaxed">{t('privacy.dataSecurityText')}</p>
            </Section>

            <Section
              title={t('privacy.yourRights')}
              delay="0.25s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            >
              <ul className="space-y-2 text-slate-600">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>{t(`privacy.yourRightsItems.${num}`)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section
              title={t('privacy.contactUs')}
              delay="0.3s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            >
              <p className="text-slate-600 mb-2">{t('privacy.contactUsText')}</p>
              <p className="text-indigo-600 font-medium">privacy@vedzeb.ge</p>
            </Section>

            <Section
              title={t('privacy.changes')}
              delay="0.35s"
              icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            >
              <p className="text-slate-600 leading-relaxed">{t('privacy.changesText')}</p>
              <p className="text-sm text-slate-400 mt-4">{t('privacy.lastUpdated')}: 2026</p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
