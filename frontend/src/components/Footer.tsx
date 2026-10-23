import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, Mic } from 'lucide-react';

export const Footer: React.FC = () => {
  const { theme, t } = useAuth();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/95 mt-24 text-slate-600 dark:text-slate-400 text-xs py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header: Brand, Mission & Security Verification */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/60">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <img
                src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="ExportPilot AI"
                width={320}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-7 w-auto"
              />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-bangla">
              {t(
                'কারখানার পণ্যের তথ্য, বাজার-রেফারেন্স এবং রপ্তানি নথির খসড়া গুছিয়ে নেওয়ার কর্মক্ষেত্র। নমুনা বাজার তথ্য যাচাই করা বায়ার যোগাযোগ নয়।',
                'A workspace for organizing product details, market references, and export document drafts. Sample market data is not verified buyer contact.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="pill-status bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bangla">{t('পরিচিত তথ্য আড়াল', 'Sensitive detail masking')}</span>
            </div>
            <div className="pill-status bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bangla">{t('কথ্য বাংলা ভয়েস ইন্টারফেস', 'Spoken Bangla Voice')}</span>
            </div>
            <div className="pill-status bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bangla">{t('রপ্তানি প্রস্তুতির সহায়তা', 'Export preparation tools')}</span>
            </div>
          </div>
        </div>

        {/* 4-Column Structured Institutional Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          {/* Column 1: Core Platform */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-200 font-mono text-[11px] uppercase tracking-wider">
              {t('বাণিজ্য প্ল্যাটফর্ম', 'Trade Platform')}
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/app" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('রপ্তানি প্রস্তুতি কর্মক্ষেত্র', 'Export Preparation Workspace')}
                </Link>
              </li>
              <li>
                <Link to="/dealroom" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('ডিল নেগোসিয়েশন রুম', 'Deal Negotiation Room')}
                </Link>
              </li>
              <li>
                <Link to="/buyers" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('নমুনা বাজার প্রোফাইল', 'Illustrative Market Profiles')}
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('ডকুমেন্টেশন গাইড', 'Documentation Guide')}
                </Link>
              </li>
              <li>
                <Link to="/presentation" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('এক্সিকিউটিভ ডেক', 'Executive Presentation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Flagship Sectors */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-200 font-mono text-[11px] uppercase tracking-wider">
              {t('জাতীয় রপ্তানি খাত', 'National Sectors')}
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/app?preset=preset_jute_bag" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('সাভার সোনালী পাট (HS 4202)', 'Savar Jute (HS 4202)')}
                </Link>
              </li>
              <li>
                <Link to="/app?preset=preset_denim_jacket" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('গাজীপুর গ্রিন ডেনিম (HS 6201)', 'Gazipur Denim (HS 6201)')}
                </Link>
              </li>
              <li>
                <Link to="/app?preset=preset_leather_boot" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('সাভার ফিনিশড লেদার (HS 6403)', 'Savar Leather (HS 6403)')}
                </Link>
              </li>
              <li>
                <Link to="/app?preset=preset_terracotta" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('বগুড়া সিরামিক ক্লে (HS 6912)', 'Bogura Terracotta (HS 6912)')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trade support and compliance */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-200 font-mono text-[11px] uppercase tracking-wider">
              {t('কমপ্লায়েন্স ও ল্যাব', 'Compliance Labs')}
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/data" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('ট্যারিফ ও ডেটা এক্সপ্লোরার', 'HS Tariff Explorer')}
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('তথ্যের গোপনীয়তা', 'Information privacy')}
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('রপ্তানি প্রক্রিয়া', 'Export Process')}
                </Link>
              </li>
              <li>
                <Link to="/audit" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('১০০-পয়েন্ট সিস্টেম অডিট', '100-Point Audit Report')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional Governance & Trust */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-200 font-mono text-[11px] uppercase tracking-wider">
              {t('নীতিমালা ও প্রতিষ্ঠান', 'Trust & Governance')}
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('আমাদের পরিচিতি ও লক্ষ্য', 'About Our Mission')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('গোপনীয়তা নীতিমালা', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('সেবার শর্তাবলী', 'Terms of Service')}
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla">
                  {t('ব্যবহার নির্দেশিকা', 'User Documentation')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon with Reassuring Security & Legal Notice */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 text-[11px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-bangla">
              {t('আপনার বাণিজ্যিক তথ্য ও পরিচয়পত্রের গোপনীয়তা আমরা গুরুত্বের সঙ্গে রক্ষা করি।', 'We take care to protect the privacy of your business information and identity documents.')}
            </span>
            <span className="font-mono text-[10px]">
              {t('সার্বভৌম ট্রেড প্ল্যাটফর্ম', 'Sovereign Trade Platform')}
            </span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-bangla">
            ExportPilot AI © 2026 EquiSaaS-BD. {t('বাংলাদেশি কারখানার রপ্তানি প্রস্তুতিতে সহায়তার জন্য তৈরি।', 'Built to support export preparation for Bangladeshi factories.')}
          </div>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-slate-500 dark:text-slate-400">
            <span>{t('নির্মাণে', 'Built by')}</span>
            <a href="https://agency.equisaas-bd.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400">
              EquiSaaS Agency
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://equisaas-bd.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400">
              EquiSaaS-BD
            </a>
            <span aria-hidden="true">·</span>
            <span>{t('প্রধান স্থপতি', 'Product architect')}</span>
            <a href="https://kholipha-ahmmad-al-amin.equisaas-bd.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400">
              Kholipha Ahmmad Al-Amin
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
