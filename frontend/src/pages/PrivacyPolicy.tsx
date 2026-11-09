import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {ShieldCheck, Lock, EyeOff, CheckCircle2, ArrowRight, HardDrive} from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('তথ্য ব্যবহারের বিবরণ', 'Privacy information')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
          {t('গোপনীয়তা ও তথ্য ব্যবহারের নীতিমালা', 'Privacy and data use')}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
          {t(
            'কিছু পরিচিত সংবেদনশীল নম্বর বাণিজ্য পরামর্শের আগে আড়াল করা হয়। ভয়েস ব্যবহারে সম্মতি দিলে রেকর্ডিং কথায় রূপান্তরের জন্য বহিরাগত সেবায় পাঠানো হয়।',
            'Some recognized sensitive numbers are masked before trade advice is requested. If you consent to voice transcription, the recording is sent to an external service.'
          )}
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
          <span>{t('হালনাগাদ: ২৩ অক্টোবর ২০২৬', 'Updated: October 23, 2026')}</span>
          <span>•</span>
          <span>{t('বর্তমান তথ্য ব্যবহার', 'Current data use')}</span>
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
              'আপনার দেওয়া তথ্য দিয়ে পণ্যের বিবরণ, বাজার পর্যালোচনা ও রপ্তানি নথির খসড়া তৈরি হয়। অনুরোধ করা বিশ্লেষণ ও সংরক্ষিত কাজ আপনার অ্যাকাউন্টের সঙ্গে রাখা হতে পারে।',
              'Details you provide are used for product information, market review, and export document drafts. Requested analysis and saved work may be stored with your account.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('অ্যাকাউন্ট মুছে ফেলার সুবিধা', 'Account deletion')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'বর্তমান সংস্করণে নিজে থেকে অ্যাকাউন্ট মুছে ফেলার ব্যবস্থা নেই। তথ্য রাখার সময় বা মুছে ফেলার বিষয়ে আপনার অ্যাকাউন্ট প্রশাসকের সঙ্গে কথা বলুন।',
              'The current version has no self-service account deletion control. Ask your account administrator about retention or deletion requests.'
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
            <span>{t('৪. বহিরাগত সেবায় তথ্য পাঠানো', '4. External service processing')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'বাণিজ্য পরামর্শের অনুরোধে পরিচিত সংবেদনশীল নম্বর আড়াল করে কনফিগার করা এআই সেবায় পাঠানো হতে পারে। ভয়েস থেকে লেখা তৈরি করতে সম্মতি দেওয়ার পর রেকর্ডিং বহিরাগত ভয়েস সেবায় পাঠানো হয়। প্রয়োজনের অতিরিক্ত ব্যক্তিগত বা আর্থিক তথ্য দেবেন না।',
                'For a requested trade-advice response, text with recognized sensitive numbers masked may be sent to the configured AI service. Voice recordings are sent to an external transcription service only after you consent. Do not provide unnecessary personal or financial details.'
              )}
            </p>
            <p>
              {t(
                'নির্দিষ্ট সেবাগুলো হলো: কথা থেকে লেখা তৈরির জন্য Deepgram (মার্কিন যুক্তরাষ্ট্র), এবং বাণিজ্য পরামর্শের জন্য Microsoft Azure OpenAI অথবা Google Gemini। ভয়েস রেকর্ডিং আড়াল করা সম্ভব নয়, তাই রেকর্ডিংয়ের আগে সম্মতি নেওয়া হয়। লেখা আকারের বাণিজ্য পরামর্শ পাঠানোর আগে পরিচিত পরিচয় ও কর নম্বর সর্বদা আড়াল করা হয়।',
                'The named services are: Deepgram (United States) for speech transcription, and Microsoft Azure OpenAI or Google Gemini for trade advice. Voice audio cannot be masked before transcription, which is why consent is requested first. Text sent for trade advice always masks recognized identity and tax numbers before dispatch.'
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
