import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '../services/api';
import { Button, Loading } from '../components/common';
import ProfileCard from '../components/profile/ProfileCard';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: recentProfiles, isLoading } = useQuery({
    queryKey: ['profiles', 'recent'],
    queryFn: () => profilesApi.getAll({ limit: 6 }),
    select: (response) => response.data.profiles
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left side - Main content */}
            <div className="flex-1 text-center lg:text-left animate-fade-in">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <form onSubmit={handleSearch} className="max-w-xl mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('home.hero.searchPlaceholder')}
                      className="w-full px-5 py-3 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
                      >
                        {t('home.hero.searchButton')}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="sm:hidden px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-xl"
                  >
                    {t('home.hero.searchButton')}
                  </button>
                </div>
              </form>

              <Link to="/create-profile">
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                  {t('home.hero.addProfile')}
                </button>
              </Link>
            </div>

            {/* Right side - Podcast video */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <a
                href="https://www.youtube.com/watch?v=1Nm5WrefQK4"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <p className="text-white text-sm font-medium mb-2 text-center">
                    {t('home.podcast.title')}
                  </p>
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src="https://img.youtube.com/vi/1Nm5WrefQK4/mqdefault.jpg"
                      alt="VEDZEB Podcast"
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-indigo-200 text-xs mt-2 text-center group-hover:text-white transition-colors">
                    {t('home.podcast.watch')}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 card-solid animate-slide-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">
                {recentProfiles?.length || 0}+
              </div>
              <div className="text-slate-600 font-medium">{t('home.stats.profiles')}</div>
            </div>

            <div className="text-center p-8 card-solid animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-pink-600 mb-2">0</div>
              <div className="text-slate-600 font-medium">{t('home.stats.reunited')}</div>
            </div>

            <div className="text-center p-8 card-solid animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {recentProfiles?.length || 0}
              </div>
              <div className="text-slate-600 font-medium">{t('home.stats.searching')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Profiles Section */}
      <section className="py-20 gradient-bg-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {t('home.recentProfiles')}
              </h2>
              <p className="text-slate-600">{t('app.slogan')}</p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group"
            >
              {t('home.viewAll')}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <Loading className="py-12" />
          ) : recentProfiles?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentProfiles.map((profile, index) => (
                <div key={profile.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card-solid">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg mb-6">{t('search.noResults')}</p>
              <Link to="/create-profile">
                <Button>{t('home.hero.addProfile')}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card-solid p-12 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('about.mission')}
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              {t('about.missionText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg">
                  {t('nav.search')}
                </button>
              </Link>
              <Link to="/about">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                  {t('nav.about')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
