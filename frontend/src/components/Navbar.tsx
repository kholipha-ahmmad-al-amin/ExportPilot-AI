import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe, Shield, Database, Cpu, LogOut, UserCheck,
  Settings, Menu, X, TrendingUp, BookOpen
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, lang, setLang, t, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNav = [
    { path: '/app',          labelBn: 'ডিল রুম',         labelEn: 'Deal Room',         Icon: TrendingUp },
    { path: '/buyers',       labelBn: 'বায়ার ক্যাটালগ',  labelEn: 'Buyer Catalog',      Icon: Globe },
    { path: '/docs',         labelBn: 'ক্যানোনিকাল ডক্স', labelEn: 'Docs',              Icon: BookOpen },
    { path: '/data',         labelBn: 'ডেটা এক্সপ্লোরার', labelEn: 'Data Lab',          Icon: Database },
    { path: '/security',     labelBn: 'সার্বভৌমত্ব',      labelEn: 'Sovereignty',        Icon: Shield },
    { path: '/architecture', labelBn: 'এজেন্ট পাইপলাইন', labelEn: 'Agent Pipeline',     Icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="ExportPilot AI - Home"
          >
            <img
              src="/logo-dark.svg"
              alt="ExportPilot AI"
              className="h-8 w-auto transition-transform group-hover:scale-[1.01]"
            />
          </Link>
          <span className="hidden sm:inline-flex pill-status pill-accent">SOVEREIGN TRADE</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {mainNav.map(({ path, labelBn, labelEn, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bangla">{t(labelBn, labelEn)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right rail */}
        <div className="flex items-center gap-2">

          {/* Language toggle - instant, no reload */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-colors select-none"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            aria-label={lang === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
            style={{ minWidth: '64px', minHeight: '36px' }}
          >
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* Auth state */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs max-w-[160px]">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate font-bangla">
                  {user.full_name_bn}
                </span>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="badge badge-gold hover:bg-amber-900 transition-colors"
                    title="System Admin Panel"
                  >
                    ADMIN
                  </Link>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
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
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {t('লগইন', 'Sign In')}
              </Link>
              <Link
                to="/app"
                className="btn-primary text-xs"
              >
                {t('শুরু করুন', 'Launch')}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
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
          className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1"
          aria-label="Mobile navigation"
        >
          {mainNav.map(({ path, labelBn, labelEn, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-300'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bangla">{t(labelBn, labelEn)}</span>
              </Link>
            );
          })}

          {!user && (
            <div className="pt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 rounded-lg transition-colors"
              >
                {t('লগইন', 'Sign In')}
              </Link>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary flex-1 text-sm"
              >
                {t('শুরু করুন', 'Launch')}
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
