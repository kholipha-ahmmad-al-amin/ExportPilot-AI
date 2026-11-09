import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, Mic } from 'lucide-react';
import { BrandLogo } from './ui/brand-logo';

export const Footer: React.FC = () => {
  const { user, t } = useAuth();
  const role = user?.role || '';
  const canExport = role === 'factory_owner' || role === 'admin';
  const isBuyer = role === 'verified_buyer';
  const canReview = role === 'compliance_auditor' || role === 'admin';
  const canSeeCatalog = canExport || isBuyer;
  const canSeeTools = canExport || canReview;
  const linkClass = 'hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bangla';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/95 mt-24 text-slate-600 dark:text-slate-400 text-xs py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header: Brand, Mission & Security Verification */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/60">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <BrandLogo variant="compact" size="sm" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-bangla">
              {t(
                'পণ্যের তথ্য, সম্ভাব্য বাজার আর রপ্তানির কাগজপত্রের খসড়া এক জায়গায় গুছিয়ে নিন। এখানে দেখানো বাজারের তথ্য নমুনা; এগুলো দিয়ে সরাসরি ক্রেতার সঙ্গে যোগাযোগ করা যায় না।',
                'A workspace for organizing product details, market references, and export document drafts. Sample market data is not verified buyer contact.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="pill-status bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bangla">{t('তথ্য আড়াল করার সহায়তা', 'Sensitive detail masking')}</span>
            </div>
            <div className="pill-status bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bangla">{t('বাংলায় বলে তথ্য দিন', 'Spoken Bangla Voice')}</span>
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
              {!user && (
                <>
                  <li>
                    <Link to="/login" className={linkClass}>
                      {t('লগইন করুন', 'Sign In')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className={linkClass}>
                      {t('অ্যাকাউন্ট খুলুন', 'Create Account')}
                    </Link>
                  </li>
                </>
              )}
              {canExport && (
                <>
                  <li>
                    <Link to="/app" className={linkClass}>
                      {t('রপ্তানি প্রস্তুতি কর্মক্ষেত্র', 'Export Preparation Workspace')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/dealroom" className={linkClass}>
                      {t('দর ও শর্তের খসড়া', 'Deal Negotiation Room')}
                    </Link>
                  </li>
                </>
              )}
              {canSeeCatalog ? (
                <li>
                  <Link to="/buyers" className={linkClass}>
                    {t('নমুনা বাজার প্রোফাইল', 'Illustrative Market Profiles')}
                  </Link>
                </li>
              ) : !user ? (
                <li>
                  <Link to="/login?from=%2Fbuyers" className={linkClass}>
                    {t('নমুনা বাজার প্রোফাইল', 'Illustrative Market Profiles')}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link to="/docs" className={linkClass}>
                  {t('ব্যবহারের নির্দেশনা', 'Documentation Guide')}
                </Link>
              </li>
              <li>
                <Link to="/presentation" className={linkClass}>
                  {t('প্রকল্পের পরিচিতি', 'Executive Presentation')}
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
              {canExport ? (
                <>
                  <li>
                    <Link to="/app?preset=preset_jute_bag" className={linkClass}>
                      {t('সাভার সোনালী পাট (HS 4202)', 'Savar Jute (HS 4202)')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/app?preset=preset_denim_jacket" className={linkClass}>
                      {t('গাজীপুর গ্রিন ডেনিম (HS 6201)', 'Gazipur Denim (HS 6201)')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/app?preset=preset_leather_boot" className={linkClass}>
                      {t('সাভার ফিনিশ্ট লেদার (HS 6403)', 'Savar Leather (HS 6403)')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/app?preset=preset_terracotta" className={linkClass}>
                      {t('বগুড়া সিরামিক ক্লে (HS 6912)', 'Bogura Terracotta (HS 6912)')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/sectors/jute" className={linkClass}>
                      {t('পাট ও পাটজাত পণ্য', 'Jute & Allied Products')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/sectors/garments" className={linkClass}>
                      {t('তৈরি পোশাক খাত', 'Apparel Sector')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/sectors/leather" className={linkClass}>
                      {t('চামড়া ও চামড়াজাত পণ্য', 'Leather Products')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/sectors/ceramics" className={linkClass}>
                      {t('সিরামিক খাত', 'Ceramics Sector')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Trade support and compliance */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-slate-200 font-mono text-[11px] uppercase tracking-wider">
              {t('কমপ্লায়েন্স ও ল্যাব', 'Compliance Labs')}
            </div>
                        <ul className="space-y-2">
              {canSeeTools && (
                <>
                  <li>
                    <Link to="/data" className={linkClass}>
                      {t('পণ্য ও শুল্কের তথ্য', 'HS Tariff Explorer')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/security" className={linkClass}>
                      {t('তথ্যের গোপনীয়তা', 'Information privacy')}
                    </Link>
                  </li>
                </>
              )}
              <li>
                {user ? (
                  <Link to="/architecture" className={linkClass}>
                    {t('রপ্তানি প্রক্রিয়া', 'Export Process')}
                  </Link>
                ) : (
                  <Link to="/login?from=%2Farchitecture" className={linkClass}>
                    {t('রপ্তানি প্রক্রিয়া', 'Export Process')}
                  </Link>
                )}
              </li>
              {user && (
                <li>
                  <Link to="/audit" className={linkClass}>
                    {t('১০০-পয়েন্ট সিস্টেম অডিট', '100-Point Audit Report')}
                  </Link>
                </li>
              )}
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
              {t('রপ্তানি প্রস্তুতির সহায়তা', 'Sovereign Trade Platform')}
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
