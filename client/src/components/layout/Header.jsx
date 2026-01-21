import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { contactsApi } from '../../services/api';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for unread messages
  const { data: requestsData } = useQuery({
    queryKey: ['contact-requests-unread'],
    queryFn: () => contactsApi.getAll(),
    select: (response) => response.data,
    enabled: isAuthenticated,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Count unread messages
  const getUnreadCount = () => {
    if (!requestsData) return 0;
    let count = 0;

    // Count from received requests
    requestsData.received?.forEach(request => {
      request.messages?.forEach(msg => {
        if (!msg.isRead && msg.senderId !== getCurrentUserId()) {
          count++;
        }
      });
    });

    // Count from sent requests
    requestsData.sent?.forEach(request => {
      request.messages?.forEach(msg => {
        if (!msg.isRead && msg.senderId !== getCurrentUserId()) {
          count++;
        }
      });
    });

    return count;
  };

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const unreadCount = getUnreadCount();

  const languages = [
    { code: 'ka', name: 'ქარ' },
    { code: 'en', name: 'EN' },
    { code: 'ru', name: 'RU' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/search', label: t('nav.search') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/filmography', label: t('nav.filmography') }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.svg"
              alt="VEDZEB Logo"
              className="w-10 h-10 drop-shadow-lg group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold gradient-text hidden sm:block">VEDZEB</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/create-profile">
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30">
                    {t('nav.createProfile')}
                  </button>
                </Link>
                <Link to="/dashboard">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all">
                    {t('nav.dashboard')}
                  </button>
                </Link>
                <Link to="/messages" className="relative">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t('nav.messages')}
                  </button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={t('nav.logout')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <button className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30">
                  {t('nav.login')}
                </button>
              </Link>
            )}

            <div className="hidden md:flex items-center bg-slate-100 rounded-xl p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    i18n.language === lang.code
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {t('nav.messages')}
                      </span>
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/create-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center"
                    >
                      {t('nav.createProfile')}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl text-left"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center"
                  >
                    {t('nav.login')}
                  </Link>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-center bg-slate-100 rounded-xl p-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                          i18n.language === lang.code
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
