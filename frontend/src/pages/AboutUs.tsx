import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Cpu, Globe, TrendingUp, Users, Award,
  CheckCircle2, ArrowRight, Building2, Leaf, Mic, Lock
} from 'lucide-react';

export const AboutUs: React.FC = () => {
  const { t } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      
      {/* Hero Mission Statement */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('জাতীয় বাণিজ্য রূপান্তর উদ্যোগ', 'National Trade Transformation Initiative')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight font-bangla">
          {t('বাংলাদেশের প্রতিটি কারখানার সরাসরি বৈশ্বিক বাণিজ্য অধিকার', 'Direct Global Export Power for Every Bangladeshi Factory')}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
          {t(
            'সাভার, গাজীপুর, বগুড়া ও চট্টগ্রামের ৫০,০০০ এর বেশি ক্ষুদ্র ও মাঝারি উৎপাদকদের আন্তর্জাতিক বাজারে সরাসরি যুক্ত করতে তৈরি হয়েছে এক্সপোর্টপাইলট এআই। মধ্যস্বত্বভোগী বায়িং হাউসের ওপর নির্ভরতা কমিয়ে কারখানার ন্যায্য মুনাফা নিশ্চিত করাই আমাদের একমাত্র লক্ষ্য।',
            'ExportPilot AI exists to dismantle the traditional 32% to 40% middleman margin squeeze. We connect Bangladeshi SME manufacturers directly with verified international buyers using sovereign, transparent artificial intelligence.'
          )}
        </p>
      </section>

      {/* 3 Core Impact Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
            {t('+৩৫% পর্যন্ত অতিরিক্ত মুনাফা', 'Up to +35% Extra Margin')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'মধ্যস্বত্বভোগী ছাড়া ইউরোপ ও জাপানের আমদানিকারকদের সাথে সরাসরি FOB রপ্তানি চুক্তি করার মাধ্যমে প্রতি চালানে ১৭ থেকে ৭২ লাখ টাকা অতিরিক্ত লাভ কারখানায় জমা হয়।',
              'Direct export contracting eliminates intermediary markups, depositing full dollar earnings straight into factory accounts.'
            )}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
            {t('১০০% ডাটা সার্বভৌমত্ব ও সুরক্ষা', '100% Data Sovereignty')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'বাণিজ্য পরামর্শে পাঠানোর আগে পরিচিত পরিচয় ও কর নম্বর আড়াল করা হয়। ভয়েস রেকর্ডিং আগে কথায় রূপান্তর করা হয়।',
              'Known identity and tax numbers are masked before trade advice is requested. Voice recordings are sent for transcription first.'
            )}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
            {t('বিনা হার্ডওয়্যারে ইইউ কার্বন অডিট', 'Zero-Hardware EU CBAM Audit')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'ফ্যাক্টরির পল্লী বিদ্যুৎ বা ডেসকো বিল থেকেই ইউরোপীয় ইউনিয়নের নতুন কার্বন ট্যাক্স (CBAM) হিসাব ও কমপ্লায়েন্স সার্টিফিকেট তৈরি হয়।',
              'Converts standard utility bills into European Union compliant Scope 2 emission declarations without expensive IOT sensors.'
            )}
          </p>
        </div>
      </section>

      {/* How the Technology Works */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 space-y-8 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            EXPORT SUPPORT
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-bangla">
            {t('রপ্তানির কাজ সহজভাবে গুছিয়ে নিন', 'A simpler way to prepare for export')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla">
            {t(
              'কারখানা মালিকদের কোনো ইংরেজি ফর্ম পূরণ করতে হয় না। মাত্র ১টি পণ্যের ছবি বা বাংলায় কথার মাধ্যমে স্বয়ংক্রিয়ভাবে সক্রিয় হয় ৫টি সমান্তরাল এজেন্ট।',
              'Factory operators need zero training. A single smartphone photo or spoken voice brief triggers five parallel autonomous agents.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">পণ্যের প্রস্তুতি</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
              {t('ছবির ব্যাকগ্রাউন্ড রিমুভ করে আন্তর্জাতিক ক্যাটালগ ও ৮-ডিজিট এইচএস কোড নির্ধারণ করে।', 'Generates studio lookbooks and determines 8-digit tariff classifications.')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">বাজার ও বায়ার</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
              {t('জার্মানি, জাপান ও যুক্তরাজ্যে সম্ভাব্য শুল্ক সুবিধা এবং উপযুক্ত বায়ার খুঁজে পেতে সাহায্য করে।', 'Finds suitable buyers and potential tariff benefits in Germany, Japan, and the UK.')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">কার্বন তথ্য</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
              {t('বিদ্যুৎ বিলের তথ্য থেকে প্রতি ইউনিটের কার্বন নিঃসরণ হিসাব করতে সাহায্য করে।', 'Estimates emissions per unit from the factory electricity bill.')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">দর ও নথি</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
              {t('এফওবি দর সাজেস্ট করে এবং বায়ারের জন্য প্রফর্মা ইনভয়েস তৈরি করে।', 'Suggests FOB pricing and prepares a proforma invoice for the buyer.')}
            </p>
          </div>
        </div>
      </section>

      {/* Congress Context & Institutional Alignment */}
      <section className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              EXPORT SUPPORT
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla mt-1">
              {t('সরাসরি রপ্তানির কাজে সহায়তা', 'Support for direct exports')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
              {t('বাংলাদেশি কারখানার জন্য', 'For Bangladeshi factories')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-bangla">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <div className="font-bold text-slate-900 dark:text-white">পণ্যের তথ্য</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">ছবি, বিবরণ এবং উৎপাদন সক্ষমতা যোগ করুন।</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <div className="font-bold text-slate-900 dark:text-white">বাজার ও বায়ার</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">গন্তব্য বাজার ও সম্ভাব্য ক্রেতা দেখুন।</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <div className="font-bold text-slate-900 dark:text-white">কার্বন হিসাব</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">বিদ্যুৎ বিল থেকে নির্গমনের হিসাব দেখুন।</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <div className="font-bold text-slate-900 dark:text-white">দর ও চুক্তি</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">এফওবি দর ও রপ্তানি নথি প্রস্তুত করুন।</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <div className="font-bold text-slate-900 dark:text-white">তথ্যের গোপনীয়তা</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">সংবেদনশীল তথ্য সুরক্ষায় সহায়তা পান।</p>
          </div>
        </div>
      </section>

      {/* Ready to Test CTA */}
      <section className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-600/70 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-bangla">
            {t('আপনার কারখানার রপ্তানি ডিল আজই প্রস্তুত করুন', 'Launch Your Direct Export Deal Today')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-bangla leading-relaxed">
            {t(
              'কোনো অগ্রিম চার্জ বা সাবস্ক্রিপশন ফি ছাড়াই মাত্র ৬০ সেকেন্ডে আন্তর্জাতিক বায়ারের জন্য প্রফরমা ইনভয়েস তৈরি করুন।',
              'Zero upfront subscription fees. Generate a verified export deal room with live buyers and proforma invoices in 60 seconds.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dealroom"
            className="btn-primary text-xs py-3 px-6 shadow-sm flex items-center gap-2 font-bangla"
          >
            <span>{t('ডিল রুম চালু করুন', 'Launch Deal Room')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/buyers"
            className="px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors font-bangla"
          >
            <span>{t('বায়ার ডিরেক্টরি দেখুন', 'Browse Buyer Directory')}</span>
          </Link>
        </div>
      </section>

    </div>
  );
};
