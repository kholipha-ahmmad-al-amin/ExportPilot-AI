import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, ArrowRight, RefreshCw, HardDrive } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('সার্বভৌম ডাটা সুরক্ষা সনদ', 'Sovereign Data Protection Charter')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
          {t('গোপনীয়তা ও ডাটা সার্বভৌমত্ব নীতিমালা', 'Privacy & Data Sovereignty Policy')}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
          {t(
            'আপনার বাণিজ্যিক তথ্য ও পরিচয়পত্রের গোপনীয়তা গুরুত্বের সঙ্গে দেখা হয়। বাণিজ্য পরামর্শে পাঠানোর আগে পরিচিত সংবেদনশীল নম্বর আড়াল করা হয়। ভয়েস রেকর্ডিং আগে কথায় রূপান্তর করা হয়।',
            'Known sensitive numbers are masked before text is sent for trade advice. Voice recordings are sent for transcription first.'
          )}
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
          <span>{t('কার্যকর তারিখ: ১ জানুয়ারি ২০২৬', 'Effective Date: January 1, 2026')}</span>
          <span>•</span>
          <span>{t('সংস্করণ: ২.৪ সার্বভৌম', 'Version: 2.4 Sovereign')}</span>
        </div>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('সংবেদনশীল তথ্য গোপন রাখা', 'Sensitive details are hidden')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'জাতীয় পরিচয়পত্র, টিআইএন, বিন ও ফোন নম্বরের পরিচিত ধরন বাণিজ্য পরামর্শে পাঠানোর আগে আড়াল করা হয়। পাঠানোর আগে লেখা নিজে দেখে নিন।',
              'Recognized identity, tax, business, and phone number formats are masked before trade advice is requested. Review the text before sending.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('আপনার তথ্যের ব্যবহার', 'How your information is used')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'আপনার দেওয়া তথ্য দিয়ে অনুরোধ করা পণ্যের বিবরণ, বায়ারের প্রস্তাব এবং রপ্তানি নথি তৈরি করা হয়।',
              'Details you provide are used to prepare the product information, buyer proposals, and export documents you request.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('সম্পূর্ণ ডেটা মোছার অধিকার', 'Right to Complete Deletion')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'আপনার অ্যাকাউন্টের তথ্য বা নথি মুছে ফেলার অনুরোধ করতে সহায়তা দলের সঙ্গে যোগাযোগ করুন।',
              'Contact the support team to request deletion of your account information or documents.'
            )}
          </p>
        </div>
      </div>

      {/* Detailed Articles */}
      <div className="space-y-6">
        
        {/* Article 1 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('তথ্যের ধরন ও উৎস', 'Information we collect')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'রপ্তানির কাজ প্রস্তুত করতে আপনার দেওয়া কারখানা, পণ্য ও যোগাযোগের তথ্য ব্যবহার করা হয়। এর মধ্যে থাকতে পারে:',
                'We use the factory, product, and contact details you provide to prepare export materials. These can include:'
              )}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300 text-xs">
              <li>{t('কারখানা বা প্রতিষ্ঠানের বাণিজ্যিক নাম, রপ্তানি উন্নয়ন ব্যুরো নিবন্ধন ও ব্যবসায়িক ইমেইল।', 'Factory or business name, Export Promotion Bureau registration, and business email.')}</li>
              <li>{t('পণ্যের ছবি, উপাদান এবং মাপের বিবরণ।', 'Product photos, materials, and measurements.')}</li>
              <li>{t('কার্বন হিসাবের জন্য বিদ্যুৎ বিল ও উৎপাদনের পরিমাণ।', 'Utility bills and production volume for an emissions estimate.')}</li>
              <li>{t('আপনার কর্মক্ষেত্রে নিরাপদে প্রবেশের জন্য ব্যবহৃত অ্যাকাউন্ট সেশন।', 'Account sessions used to provide access to your workspace.')}</li>
            </ul>
          </div>
        </section>

        {/* Article 2 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('সংবেদনশীল তথ্য গোপন করার নিয়ম', 'How sensitive details are hidden')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'জাতীয় পরিচয়পত্র, টিআইএন, বিন ও ফোন নম্বরের পরিচিত ধরন প্রস্তাব তৈরির আগে গোপন করা হয়। স্বয়ংক্রিয় শনাক্তকরণ সব ধরনের ব্যক্তিগত তথ্য ধরতে পারে না, তাই পাঠানোর আগে তথ্য যাচাই করুন।',
                'Recognized national ID, tax, business, and phone number formats are masked before a proposal is prepared. Automatic masking may not catch every private detail, so review information before sending.'
              )}
            </p>
          </div>
        </section>

        {/* Article 3 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('বিজ্ঞাপন ও সাইটের পছন্দ', 'Advertising and site preferences')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'এই সাইটে আপনার ভাষা ও থিমের পছন্দ ব্রাউজারে সংরক্ষিত থাকে।',
                'Your language and theme preferences are stored in your browser.'
              )}
            </p>
          </div>
        </section>

        {/* Article 4 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('৪. আন্তর্জাতিক বাণিজ্য মান ও আইনের সাথে সামঞ্জস্য', '4. Regulatory & Cross-Border Compliance')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'আমাদের নীতিমালা গণপ্রজাতন্ত্রী বাংলাদেশের তথ্য ও যোগাযোগ প্রযুক্তি আইন ২০০৬, সাইবার নিরাপত্তা নির্দেশিকা এবং ইউরোপীয় ইউনিয়নের জেনারেল ডেটা প্রোটেকশন রেগুলেশন (জিডিপিআর) নীতিমালার সাথে সামঞ্জস্য রেখে প্রণীত হয়েছে। আন্তর্জাতিক ক্রেতাদের যাচাইয়ের সময় আমরা বিশ্ব বাণিজ্য সংস্থা (ডব্লিউটিও) মান অনুসরণ করি।',
                'This policy adheres to the Information and Communication Technology Act of Bangladesh, national cybersecurity directives, and EU GDPR requirements governing international business-to-business transactions.'
              )}
            </p>
          </div>
        </section>

      </div>

      {/* Bottom CTA */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('তথ্য গোপন রাখার নমুনা দেখুন', 'Review the privacy preview')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
            {t('নমুনা তথ্য দিয়ে দেখুন কোন পরিচয়তথ্য গোপন রাখা হয়।', 'Use sample information to see which personal details are hidden.')}
          </p>
        </div>
        <Link
          to="/security"
          className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shrink-0 font-bangla"
        >
          <span>{t('সিকিউরিটি ল্যাব চালু করুন', 'Open Security Lab')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
