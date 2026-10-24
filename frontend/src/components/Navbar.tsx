import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe, Shield, Database, Cpu, LogOut, UserCheck,
  Menu, X, TrendingUp, BookOpen, ChevronDown, Layers, Award,
  ArrowRight, Sun, Moon, LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, lang, setLang, theme, toggleTheme, t, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close the mobile drawer whenever the route changes (covers browser back
  // and keyboard navigation, not just link clicks).
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Public visitor navigation. The buyers catalog requires an account, so
  // anonymous visitors are routed through sign-in and land in /buyers after
  // logging in instead of hitting the access wall cold.
  const publicNav = [
    { href: '/#sectors',      labelBn: 'পণ্য ও খাত',          labelEn: 'Products & Sectors' },
    { href: '/#how-it-works',  labelBn: 'কীভাবে কাজ করে',      labelEn: 'How It Works' },
    { href: '/#calculator',    labelBn: 'মার্জিন ক্যালকুলেটর', labelEn: 'Margin Calculator' },
    { href: '/login?from=%2Fbuyers', labelBn: 'বায়ার নেটওয়ার্ক', labelEn: 'Buyers Network' },
    { href: '/about',          labelBn: 'আমাদের সম্পর্কে',     labelEn: 'About Us' },
    { href: '/docs',           labelBn: 'ডকুমেন্টেশন',         labelEn: 'Documentation' },
  ];

  // Authenticated workspaces navigation
  const authCoreNav = [
    { path: '/app',      labelBn: 'ওয়ার্কস্পেস',        labelEn: 'Workspace',    Icon: LayoutDashboard },
    { path: '/dealroom', labelBn: 'ডিল রুম',         labelEn: 'Deal Room',    Icon: TrendingUp },
    { path: '/buyers',   labelBn: 'বায়ার ডিরেক্টরি', labelEn: 'Buyers',       Icon: Globe },
    { path: '/audit',    labelBn: 'অডিট স্কোরকার্ড',  labelEn: 'Audit Report', Icon: Award },
    { path: '/docs',     labelBn: 'ডকুমেন্টেশন',      labelEn: 'Docs',         Icon: BookOpen },
  ];

  const toolsNav = [
    { path: '/data',         labelBn: 'নথি ও বাজার তথ্য',      labelEn: 'Trade information',  Icon: Database, descBn: 'নথি ও পণ্যের বাজার দেখুন', descEn: 'Review documents and product markets' },
    { path: '/security',     labelBn: 'তথ্যের গোপনীয়তা',       labelEn: 'Information privacy', Icon: Shield,   descBn: 'সংবেদনশীল তথ্য কীভাবে গোপন থাকে', descEn: 'How sensitive details are protected' },
    { path: '/architecture', labelBn: 'রপ্তানি প্রক্রিয়া',     labelEn: 'Export Process', Icon: Cpu,      descBn: 'পণ্য থেকে রপ্তানি নথি পর্যন্ত', descEn: 'From product to export documents' },
    { path: '/audit',        labelBn: '১০০-পয়েন্ট স্কোরকার্ড',     labelEn: 'Scorecard Report',  Icon: Award,    descBn: 'ইন্টারন্যাশনাল স্ট্যান্ডার্ড অডিট', descEn: 'Institutional Rubric' },
  ];

  const role = user?.role || '';
  const canExport = role === 'factory_owner' || role === 'admin';
  const isBuyer = role === 'verified_buyer';
  const canReview = role === 'compliance_auditor' || role === 'admin';
  const visibleCoreNav = authCoreNav.filter((item) => {
    if (item.path === '/docs') return true;
    // Auditors and admins get the scorecard in the core bar; exporters reach
    // it through Tools, so the link never appears twice for any role.
    if (item.path === '/audit') return canReview;
    if (item.path === '/app') return canExport;
    if (item.path === '/dealroom') return canExport;
    if (item.path === '/buyers') return canExport || isBuyer;
    return false;
  });
  const visibleToolsNav = toolsNav.filter((item) => {
    if (item.path === '/architecture') return true;
    if (item.path === '/audit') return canExport;
    if (item.path === '/data' || item.path === '/security') return canExport || canReview;
    return false;
  });

  const isToolsActive = visibleToolsNav.some(item => location.pathname === item.path);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

        {/* Brand Logo (Clean & Responsive) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="ExportPilot AI - Home"
          >
            <img
              src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
              alt="ExportPilot AI"
              width={320}
              height={56}
              className="h-8 w-auto transition-transform group-hover:scale-[1.01]"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {user ? (
            /* Authenticated Nav */
            <>
              {visibleCoreNav.map(({ path, labelBn, labelEn, Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bangla">{t(labelBn, labelEn)}</span>
                  </Link>
                );
              })}

              {/* Tools & Labs Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isToolsActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900'
                  }`}
                  aria-expanded={toolsDropdownOpen}
                  aria-haspopup="true"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bangla">{t('টুলস ও ল্যাব', 'Tools & Labs')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xl backdrop-blur-xl p-2 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      {t('বাণিজ্য সহায়তা', 'Trade support')}
                    </div>
                    <div className="mt-1 space-y-1">
                      {visibleToolsNav.map(({ path, labelBn, labelEn, Icon, descBn, descEn }) => {
                        const isActive = location.pathname === path;
                        return (
                          <Link
                            key={path}
                            to={path}
                            onClick={() => setToolsDropdownOpen(false)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/90'
                            }`}
                          >
                            <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold leading-snug font-bangla">
                                {t(labelBn, labelEn)}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-bangla">
                                {t(descBn, descEn)}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Public Clean Nav */
            publicNav.map(({ href, labelBn, labelEn }) => {
              const isExternalOrAnchor = href.includes('#');
              const isActive = !isExternalOrAnchor && location.pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="font-bangla">{t(labelBn, labelEn)}</span>
                </Link>
              );
            })
          )}
        </nav>

        {/* Right rail: Theme Toggle, Language Toggle, and Auth */}
        <div className="flex items-center gap-2">

          {/* Theme Mode Toggle (Day / Night) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-slate-700 transition-colors shadow-sm select-none"
            title={theme === 'dark' ? t('ডে মোডে পরিবর্তন করুন', 'Switch to Day Mode') : t('নাইট মোডে পরিবর্তন করুন', 'Switch to Night Mode')}
            aria-label={theme === 'dark' ? t('ডে মোডে পরিবর্তন করুন', 'Switch to Day Mode') : t('নাইট মোডে পরিবর্তন করুন', 'Switch to Night Mode')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors select-none shadow-sm"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            aria-label={lang === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>

          {/* Auth state */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs max-w-[190px]">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate font-bangla">
                  {user.full_name_bn}
                </span>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:border-amber-800/80 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
                    title="System Admin Panel"
                  >
                    ADMIN
                  </Link>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-900 transition-colors"
                aria-label={t('লগআউট', 'Log out')}
                title={t('লগআউট', 'Log out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                {t('সাইন ইন', 'Sign In')}
              </Link>
              <Link
                to="/dealroom"
                className="btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
              >
                <span>{t('ডিল রুম চালু করুন', 'Launch Deal Room')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? t('মেনু বন্ধ করুন', 'Close menu') : t('মেনু খুলুন', 'Open menu')}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-xl animate-slide-up shadow-lg"
          aria-label="Mobile navigation"
        >
          {user ? (
            <>
              <div className="px-3 py-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('প্রধান ড্যাশবোর্ড', 'Main Workspaces')}
              </div>
              {visibleCoreNav.map(({ path, labelBn, labelEn, Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bangla">{t(labelBn, labelEn)}</span>
                  </Link>
                );
              })}

              {visibleToolsNav.length > 0 && (
                <>
                  <div className="pt-2 px-3 py-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('টুলস ও ল্যাব', 'Tools & Labs')}
                  </div>
                  {visibleToolsNav.map(({ path, labelBn, labelEn, Icon }) => {
                    const isActive = location.pathname === path;
                    return (
                      <Link
                        key={path}
                        to={path}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bangla">{t(labelBn, labelEn)}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={location.pathname === '/admin' ? 'page' : undefined}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800/80 font-bangla transition-colors"
                >
                  <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t('সিস্টেম অ্যাডমিন প্যানেল', 'System Admin Panel')}</span>
                </Link>
              )}
            </>
          ) : (
            <>
              {publicNav.map(({ href, labelBn, labelEn }) => {
                const isAnchor = href.includes('#');
                const targetPath = href.split('?')[0];
                const isActive = !isAnchor && location.pathname === targetPath;
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span className="font-bangla">{t(labelBn, labelEn)}</span>
                  </Link>
                );
              })}

              <div className="pt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-900 dark:border-slate-800 rounded-lg transition-colors"
                >
                  {t('সাইন ইন', 'Sign In')}
                </Link>
                <Link
                  to="/dealroom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-xs py-2.5 justify-center"
                >
                  {t('ডিল রুম চালু করুন', 'Launch')}
                </Link>
              </div>
            </>
          )}
        </nav>
      )}
    </header>
  );
};
