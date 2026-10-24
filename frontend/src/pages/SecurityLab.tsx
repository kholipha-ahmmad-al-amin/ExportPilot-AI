import React, { useState, useEffect } from 'react';
import {useAuth} from '../context/AuthContext';
import {ShieldCheck, Lock, EyeOff} from 'lucide-react';
import {redactBangladeshPii} from '../utils/piiRedactor';
import {SovereignShieldBadge} from '../components/SovereignShieldBadge';

export const SecurityLab: React.FC = () => {
  const { t } = useAuth();

  const [inputSample, setInputSample] = useState(
    'সাভার কারখানার মালিক রহিম উদ্দিনের NID নম্বর: 19882694812004512 এবং ট্যাক্স শনাক্তকরণ নম্বর TIN: 558492011234। ফ্যাক্টরির ভ্যাট BIN: 004192837-0101 এবং মোবাইল নম্বর +8801712984920। অগ্রণী ব্যাংক হিসাব নম্বর: 20491829401928। এই ডকুমেন্ট ইউরোপে পাঠানোর আগে গোপন তথ্য রক্ষা করতে হবে।'
  );
  const [redactedResult, setRedactedResult] = useState<any>(null);

  const handleTestFilter = () => {
    setRedactedResult(redactBangladeshPii(inputSample));
  };

  useEffect(() => {
    handleTestFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
          {t('তথ্যের গোপনীয়তা', 'Information privacy')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {t('সংবেদনশীল তথ্য কীভাবে গোপন থাকে', 'How sensitive information is protected')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl font-bangla">
          {t(
            'জাতীয় পরিচয়পত্র, টিআইএন, বিন, ফোন ও ব্যাংক হিসাবের মতো সংবেদনশীল তথ্য ব্রাউজারেই গোপন করা হয়।',
            'National IDs, tax numbers, phone numbers, and bank details are masked in your browser before the request is sent.'
          )}
        </p>
      </div>

      {/* Interactive privacy preview */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <EyeOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('তথ্য গোপন রাখার নমুনা', 'Privacy preview')}</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {t('নমুনা তথ্য দেখে কোন অংশগুলো গোপন করা হয় তা যাচাই করুন:', 'Review the sample to see which details are hidden before sharing.')}
            </p>
          </div>

          <button
            onClick={handleTestFilter}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('নমুনা যাচাই করুন', 'Review sample')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Raw Input */}
          <div className="space-y-2">
            <label htmlFor="security-lab-sample" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('নমুনা বাণিজ্যিক তথ্য:', 'Sample business information:')}
            </label>
            <textarea
              id="security-lab-sample"
              rows={8}
              maxLength={20000}
              value={inputSample}
              onChange={(e) => setInputSample(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 focus:border-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Redacted Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {t('তথ্য গোপন করার পর:', 'After details are hidden:')}
              </label>
              {redactedResult && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  {redactedResult.total_redactions} {t('টি তথ্য গোপন', 'details hidden')}
                </span>
              )}
            </div>

            <div className="h-[188px] p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-y-auto leading-relaxed">
              {redactedResult ? (
                redactedResult.redacted_text
              ) : (
                <span className="text-slate-500 dark:text-slate-400 italic">
                  {t('উপরে নমুনা যাচাই করুন বোতামে ক্লিক করুন।', 'Select Review sample above to continue.')}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Entities Detected Breakdown */}
        {redactedResult && redactedResult.detected_entities.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t('যে তথ্যগুলো গোপন রাখা হয়েছে:', 'Details that were hidden:')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {redactedResult.detected_entities.map((ent: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-sm">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold uppercase">{ent.type}</div>
                  <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">{ent.replacement}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sovereign shield status */}
      <SovereignShieldBadge />

      {/* Account access overview */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('অ্যাকাউন্ট অনুযায়ী তথ্যের প্রবেশাধিকার', 'Information access by account type')}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">{t('অ্যাকাউন্ট ভূমিকা', 'Account role')}</th>
                <th className="p-3">{t('এফওবি মূল্য ও ডিল', 'FOB pricing & deals')}</th>
                <th className="p-3">{t('বিদ্যুৎ বিলের মূল তথ্য', 'Raw utility bill data')}</th>
                <th className="p-3">{t('বায়ার যোগাযোগ', 'Buyer outreach')}</th>
                <th className="p-3">{t('সিস্টেম লগ ও কনফিগ', 'System logs & config')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{t('রপ্তানিকারক (কারখানা মালিক)', 'Exporter (factory owner)')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('নিজের বিশ্লেষণ ও খসড়া', 'Own analyses and drafts')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('নিজের আপলোড করা বিল', 'Own uploaded bills')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('খসড়া প্রস্তাব তৈরি', 'Draft proposals')}</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">{t('সীমাবদ্ধ', 'Restricted')}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-blue-700 dark:text-blue-400">{t('যাচাইকৃত আন্তর্জাতিক ক্রেতা', 'Verified buyer')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('উদ্ধৃত এফওবি দেখা', 'Read quoted FOB')}</td>
                <td className="p-3 text-rose-700 dark:text-rose-400">{t('প্রবেশাধিকার নেই', 'No access')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('আরএফকিউ প্রকাশ ও প্রস্তাব গ্রহণ', 'Post RFQs, receive offers')}</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">{t('সীমাবদ্ধ', 'Restricted')}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-amber-700 dark:text-amber-400">{t('কমপ্লায়েন্স অডিটর', 'Compliance auditor')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('পর্যালোচনামূলক পড়া', 'Advisory review')}</td>
                <td className="p-3 text-rose-700 dark:text-rose-400">{t('শুধু লুকানো মেট্রিক্স', 'Redacted metrics only')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('নিরীক্ষা নোট', 'Audit notes')}</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">{t('নিরাপত্তা ইভেন্ট পড়া', 'Read security events')}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-sky-700 dark:text-sky-400">{t('সিস্টেম অ্যাডমিনিস্ট্রেটর', 'System administrator')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('পূর্ণ প্রবেশাধিকার', 'Full access')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('শুধু অডিট লগ', 'Audit logs only')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400">{t('রাউটিং নিয়ন্ত্রণ', 'Manage routing')}</td>
                <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">{t('পূর্ণ নিয়ন্ত্রণ', 'Full control')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
