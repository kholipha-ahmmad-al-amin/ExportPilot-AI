import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, ArrowRight, Home, TrendingUp, Globe, BookOpen } from 'lucide-react';

export const NotFound: React.FC = () => {
  const { t } = useAuth();

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Status Badge & Icon */}
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
              HTTP 404 - NOT FOUND
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-bangla tracking-tight">
              {t('কাঙ্ক্ষিত পাতাটি খুঁজে পাওয়া যায়নি', 'Page Not Found')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-bangla">
              {t(
                'আপনি যে ওয়েব ঠিকানাটিতে প্রবেশের চেষ্টা করছেন তা হয়তো স্থানান্তরিত হয়েছে অথবা ভুল ইউআরএল টাইপ করা হয়েছে। নিচের প্রয়োজনীয় পাতাগুলোর মাধ্যমে পুনরায় আপনার ওয়ার্কস্পেসে ফিরে যান।',
                'The link you followed may be broken or the URL was entered incorrectly. Use the quick links below to navigate back to your workspace.'
              )}
            </p>
          </div>
        </div>

        {/* Actionable Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <Link
            to="/app"
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {t('সরাসরি ডিল রুম', 'Export Deal Room')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
                    {t('পণ্য স্ক্যান ও বায়ার ম্যাচ', 'Scan products & match buyers')}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            to="/buyers"
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {t('বায়ার ডিরেক্টরি', 'Buyer Directory')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
                    {t('আন্তর্জাতিক আমদানিকারকদের তালিকা', 'Verified global importers')}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            to="/docs"
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {t('ব্যবহারকারী নির্দেশিকা', 'User Documentation')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
                    {t('ধাপে ধাপে ব্যবহারের নিয়মাবলী', 'Step-by-step user tutorials')}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            to="/"
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-bangla">
                    {t('মূল পাতা', 'Home Portal')}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla">
                    {t('এক্সপোর্টপাইলট এআই পরিচিতি', 'Platform overview & sectors')}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        </div>

        {/* Primary Return Button */}
        <div className="pt-2">
          <Link
            to="/"
            className="btn-primary text-xs py-3 px-6 inline-flex items-center gap-2 shadow-sm font-bangla"
          >
            <Home className="w-4 h-4" />
            <span>{t('প্রধান পাতায় ফিরে যান', 'Back to Home')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
