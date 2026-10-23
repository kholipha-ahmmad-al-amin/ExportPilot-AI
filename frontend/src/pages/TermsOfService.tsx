import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileCheck2, Scale, DollarSign, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, Globe } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  const { t } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
          <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('আন্তর্জাতিক বাণিজ্য চুক্তি ও সেবা নীতিমালা', 'Trade Charter & Terms of Service')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
          {t('সেবা গ্রহণের সাধারণ শর্তাবলী', 'Terms of Service')}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
          {t(
            'এক্সপোর্টপাইলট এআই প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলী মেনে নিতে সম্মত হচ্ছেন। আমাদের মূল লক্ষ্য হল কারখানা ও ক্রেতার মধ্যে স্বচ্ছ, নিরাপদ এবং মধ্যস্বত্বভোগীমুক্ত সরাসরি বাণিজ্য প্রতিষ্ঠা করা।',
            'By accessing or utilizing the ExportPilot AI platform, you agree to comply with and be bound by the following terms. Our objective is to facilitate direct, transparent, and verified cross-border trade.'
          )}
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
          <span>{t('কার্যকর তারিখ: ১ জানুয়ারি ২০২৬', 'Effective Date: January 1, 2026')}</span>
          <span>•</span>
          <span>{t('সংস্করণ: ২.৪ বাণিজ্যিক', 'Version: 2.4 Commercial')}</span>
        </div>
      </div>

      {/* 3 Core Commercial Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('১% সাফল্য নির্ভর ফি', '1% Success-Based Fee')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'কোনো মাসিক সাবস্ক্রিপশন ফি বা অগ্রিম চার্জ নেই। কেবল সফলভাবে এলসি সম্পন্ন ও চালানের অর্থ নিশ্চিত হলেই কারখানা ১% প্ল্যাটফর্ম ফি প্রদান করে।',
              'Zero monthly subscription fees. A 1% platform fee applies strictly upon successful letter of credit settlement.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('যাচাইকৃত আন্তর্জাতিক বায়ার', 'Verified Importers Only')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'প্ল্যাটফর্মে প্রদর্শিত সকল ক্রেতা আন্তর্জাতিক চেম্বার অব কমার্স ও ট্যাক্স রেজিস্ট্রেশন দ্বারা প্রি-ভেরিফাইড। কোনো ভুয়া বায়ারকে যুক্ত হতে দেওয়া হয় না।',
              'All featured global importers undergo commercial registration and tax verification prior to inclusion in the directory.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('আইনি সুরক্ষা ও আন্তর্জাতিক সালিশ', 'Institutional Arbitration')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'যেকোনো বাণিজ্যিক জটিলতায় বাংলাদেশ সালিশ আইন ২০০১ এবং আন্তর্জাতিক চেম্বার অব কমার্স (আইসিসি) সালিশী কাঠামোর আওতায় নিষ্পত্তি পরিচালিত হবে।',
              'Commercial disputes are resolved pursuant to the Bangladesh Arbitration Act 2001 and ICC international trade standards.'
            )}
          </p>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-6">
        
        {/* Section 1 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('১. প্ল্যাটফর্ম সেবার পরিধি', '1. Scope of Platform Facilitation')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'এক্সপোর্টপাইলট এআই একটি আধুনিক বাণিজ্য সুবিধা প্রদানকারী সফটওয়্যার প্ল্যাটফর্ম। প্ল্যাটফর্মটি রপ্তানিকারক ও আমদানিকারকের মাঝে যোগাযোগ স্থাপন, এইচএস কোড বিশ্লেষণ, শুল্কমুক্ত বাজার অনুসন্ধান, ইউটিলিটি বিল থেকে সিবিএএম কার্বন হিসাব এবং প্রফরমা ইনভয়েস প্রস্তুত করতে কৃত্রিম বুদ্ধিমত্তা এজেন্ট ব্যবহার করে।',
                'ExportPilot AI is a specialized trade facilitation technology platform. It utilizes autonomous multi-agent systems to assist Bangladeshi SME exporters with HS tariff classification, international buyer matching, EU CBAM carbon audits, and bilingual contract drafting.'
              )}
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('২. রপ্তানিকারক ও কারখানার দায়বদ্ধতা', '2. Exporter Representations & Warranties')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'রপ্তানিকারক নিশ্চিত করবেন যে প্ল্যাটফর্মে আপলোড করা পণ্যের বিবরণ, ছবি, কোয়ালিটি সার্টিফিকেশন এবং ইউটিলিটি বিল সম্পূর্ণ নির্ভুল এবং সত্য। অবৈধ, জালিয়াতিপূর্ণ বা জাতীয় রপ্তানি নীতি আদেশ বিরোধী কোনো পণ্য প্রদর্শিত হলে সংশ্লিষ্ট অ্যাকাউন্ট তাৎক্ষণিকভাবে স্থগিত করা হবে।',
                'Exporters warrant that all product specifications, photographs, quality certifications, and factory utility bills uploaded are genuine and lawful. Any submission violating national export policy orders will trigger immediate account revocation.'
              )}
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('৩. মূল্য নির্ধারণ ও পেমেন্ট নিরাপত্তা', '3. Pricing, Invoicing & Letter of Credit')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'প্ল্যাটফর্মে প্রস্তুতকৃত এফওবি (FOB) অথবা সিআইএফ (CIF) দর双方 সমঝোতার ভিত্তিতে চূড়ান্ত হবে। অর্থ আদান-প্রদান সরাসরি অনুমোদিত আন্তর্জাতিক ব্যাংকের মাধ্যমে লেটার অব ক্রেডিট (LC) বা অনুমোদিত এসক্রো চ্যানেলে সম্পাদিত হবে। এক্সপোর্টপাইলট এআই কখনো ব্যবহারকারীর কোনো সরাসরি ব্যাংক ব্যালেন্স সংরক্ষণ করে না।',
                'All negotiated FOB or CIF prices are finalized between the contracting parties. Settlement must occur through authorized international commercial banks via irrevocable Letters of Credit (LC) or approved trade escrow facilities. ExportPilot AI never directly holds exporter funds.'
              )}
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('৪. কাস্টমস ও চালানের দায়মুক্তি', '4. Limitation of Customs & Shipping Liability')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'এক্সপোর্টপাইলট এআই এর স্বয়ংক্রিয় এজেন্টগণ আন্তর্জাতিক বাণিজ্য তথ্য বিশ্লেষণ করে সহায়তা প্রদান করে। তবে শারীরিক পণ্যের প্যাকিং, পোর্ট ক্লিয়ারেন্স, শিপিং এবং কাস্টমস ট্যাক্স পরিশোধের মূল আইনি দায়িত্ব সংশ্লিষ্ট রপ্তানিকারক ও আমদানিকারকের ওপর বর্তাবে।',
                'ExportPilot AI provides automated algorithmic trade recommendations and intelligence. Physical customs clearance, port transit, inspection adherence, and cargo delivery remain the operational responsibility of the contracting commercial entities.'
              )}
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('৫. প্রযোজ্য আইন ও আঞ্চলিক এখতিয়ার', '5. Governing Law & Jurisdiction')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন দ্বারা নিয়ন্ত্রিত হবে। প্ল্যাটফর্ম ব্যবহার সংক্রান্ত যেকোনো আইনি বিরোধ ঢাকার সংশ্লিষ্ট আদালতের এখতিয়ারভুক্ত থাকবে।',
                'These terms shall be governed by and construed in accordance with the laws of the People\'s Republic of Bangladesh, with exclusive jurisdiction resting in the competent courts of Dhaka.'
              )}
            </p>
          </div>
        </section>

      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('কোনো প্রশ্ন বা বাণিজ্যিক সহায়তার প্রয়োজন?', 'Have questions regarding our trade terms?')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
            {t('আমাদের কমপ্লায়েন্স টিম বাংলাদেশের সকল কারখানার সহায়তার জন্য প্রস্তুত।', 'Our institutional trade compliance team is ready to support your factory.')}
          </p>
        </div>
        <Link
          to="/about"
          className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shrink-0 font-bangla"
        >
          <span>{t('আমাদের সম্পর্কে জানুন', 'Learn About Us')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
