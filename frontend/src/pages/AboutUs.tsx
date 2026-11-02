import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {ShieldCheck, TrendingUp, ArrowRight, Leaf, Lock} from 'lucide-react';

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
          {t('কারখানার রপ্তানি প্রস্তুতি সহজভাবে গুছিয়ে নিন', 'Prepare your factory for export, step by step')}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
          {t(
            'এক্সপোর্টপাইলট এআই কারখানার পণ্যের তথ্য, প্রাথমিক বাজার-রেফারেন্স, কার্বন হিসাব এবং রপ্তানি নথির খসড়া এক জায়গায় গুছিয়ে রাখতে সাহায্য করে। এই সংস্করণে যাচাইকৃত বায়ার যোগাযোগ বা লেনদেন পরিচালনার সুবিধা নেই।',
            'ExportPilot AI helps Bangladeshi manufacturers organize product details, indicative market references, emissions estimates, and export document drafts. This version does not provide verified buyer contacts or manage transactions.'
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
            {t('নমুনা মার্জিন হিসাব', 'Illustrative margin estimate')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'ক্যালকুলেটরের নমুনা অনুমানের ভিত্তিতে হিসাব দেখানো হয়। প্রকৃত লাভ পণ্যের দর, খরচ, চালান ও চুক্তির শর্তের ওপর নির্ভর করে।',
              'The calculator uses sample assumptions. Actual returns depend on product price, costs, shipment details, and contract terms.'
            )}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
            {t('পরিচিত সংবেদনশীল নম্বর আড়াল', 'Masking known sensitive numbers')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'পরামর্শের অনুরোধে পরিচিত কিছু পরিচয় ও কর নম্বর আড়াল করা হয়। স্বয়ংক্রিয় শনাক্তকরণ সব তথ্য ধরতে পারে না, তাই পাঠানোর আগে দেখে নিন।',
              'Some recognized identity and tax numbers are masked before trade advice is requested. Automatic detection may miss details, so review text before sending.'
            )}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
            {t('বিদ্যুৎ বিল থেকে কার্বন অনুমান', 'Emissions estimate from utility bills')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'বিদ্যুৎ বিল ও উৎপাদনের তথ্য থেকে প্রাথমিক নির্গমন হিসাব তৈরি হয়। এটি নিরীক্ষিত CBAM ঘোষণা বা সনদ নয়।',
              'A preliminary emissions estimate can be prepared from utility and production data. It is not an audited CBAM declaration or certificate.'
            )}
          </p>
        </div>
      </section>

      {/* Export preparation tools */}
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
              'পণ্যের ছবি, বিবরণ বা বাংলায় বলা তথ্য দিয়ে শুরু করে প্রয়োজনীয় বাণিজ্যিক তথ্য এক জায়গায় গুছিয়ে নিন।',
              'Start with a product photo, description, or spoken brief, then organize the details needed for export preparation.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">পণ্যের প্রস্তুতি</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
              {t('পণ্যের তথ্য সাজান এবং HS কোডের প্রাথমিক পরামর্শ দেখুন। চূড়ান্ত কোড যাচাই করুন।', 'Organize product details and review a suggested HS code. Confirm the final classification.')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">বাজার ও বায়ার</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bangla">
              {t('নমুনা বাজার প্রোফাইল ও শুল্কের রেফারেন্স দেখুন। এগুলো যাচাইকৃত বায়ার বা বর্তমান শুল্কের নিশ্চয়তা নয়।', 'Review illustrative market profiles and tariff references. They are not verified buyers or guaranteed current rates.')}
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
              {t('এফওবি দর, প্রফর্মা ইনভয়েস ও বার্তার খসড়া তৈরি করুন। পাঠানোর আগে সব তথ্য যাচাই করুন।', 'Prepare an FOB price, proforma invoice, and message draft. Check every detail before sharing.')}
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

      {/* Multidisciplinary Team & Advisory Board */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              MULTIDISCIPLINARY EXECUTION TEAM
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla mt-1">
              {t('আমাদের বহুমুখী টিম ও বৈশ্বিক উপদেষ্টা মণ্ডলী', 'Core Execution Team & Global Advisors')}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm">
            AIBC 2026 Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Team Lead & Architect</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Kholipha Ahmmad Al-Amin</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              সিস্টেম আর্কিটেকচার, ফাস্টএমসিপি ৫-এজেন্ট পাইপলাইন এবং পূর্ণাঙ্গ ডেপ্লয়মেন্ট।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Data Scientist & AI</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Jannatul Ferdous</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              ডিপগ্রাম নোভা-৩ বাংলা স্পিচ পাইপলাইন ও চেইন-অব-থট প্রম্পট ইঞ্জিনিয়ারিং।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Lead UI/UX Architect</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Khadija Akter</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              ডব্লিউসিএজি ২.১ এএ স্ট্যান্ডার্ড, রেসপনসিভ ফ্যাক্টরি ডিজাইন এবং ফাস্ট মোড।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Backend & GraphRAG</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Abu Hurayra</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              ফাস্টএপিআই ব্যাকএন্ড, নেটওয়ার্কএক্স নলেজ গ্রাফ এবং অফলাইন ডকুমেন্ট পার্সিং।
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trade Economics Lead</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Kazi Sabbir</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla leading-relaxed">
              পোস্ট-এলডিসি ২০২৬ ট্যারিফ রুলস, আইসিসি ইউসিপি ৬০০ ও বাংলাদেশ ব্যাংক সার্কুলার রিসার্চ।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white font-bangla">
              {t('প্রবাসী বাংলাদেশি গবেষক ও প্রযুক্তিবিদদের মেন্টরশিপ (NRB Advisory)', 'Non-Resident Bangladeshi (NRB) Advisory Panel')}
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] font-bangla mt-0.5">
              আইআইটি রুড়কি এবং ট্রিনিটি কলেজ ডাবলিনের প্রবাসী বাংলাদেশি গবেষকদের প্রযুক্তিগত পরামর্শে সিস্টেমের স্কেলেবিলিটি যাচাইকৃত।
            </p>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
            Validated Architecture
          </span>
        </div>
      </section>

      {/* Ready to Test CTA */}
      <section className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-600/70 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-bangla">
            {t('রপ্তানির তথ্য ও নথির খসড়া গুছিয়ে নিন', 'Organize export details and document drafts')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-bangla leading-relaxed">
            {t(
              'পণ্যের তথ্য, বাজার-রেফারেন্স ও নথির খসড়া এক জায়গায় প্রস্তুত করুন। বায়ার যোগাযোগ ও চুক্তি আলাদাভাবে যাচাই ও সম্পন্ন করতে হবে।',
              'Prepare product details, market references, and document drafts in one workspace. Buyer contact and any contract must be verified and completed separately.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dealroom"
            className="btn-primary text-xs py-3 px-6 shadow-sm flex items-center gap-2 font-bangla"
          >
            <span>{t('প্রস্তুতি শুরু করুন', 'Start preparing')}</span>
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
