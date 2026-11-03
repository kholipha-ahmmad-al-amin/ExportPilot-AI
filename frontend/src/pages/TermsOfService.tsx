import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Scale, DollarSign, CheckCircle2, ArrowRight, Globe} from 'lucide-react';

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
            'এই পৃষ্ঠায় বর্তমান সংস্করণের কাজের সীমা ও ব্যবহারকারীর দায়িত্ব লেখা আছে। পণ্য, বাজার ও নথির ফলাফল যাচাই করে ব্যবহার করুন।',
            'This page describes the current service and your responsibilities. Review and verify product, market, and document outputs before using them.'
          )}
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
          <span>{t('হালনাগাদ: ২৩ অক্টোবর ২০২৬', 'Updated: October 23, 2026')}</span>
          <span>•</span>
          <span>{t('বর্তমান সেবার বিবরণ', 'Current service description')}</span>
        </div>
      </div>

      {/* 3 Core Commercial Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('পেমেন্ট সুবিধা নেই', 'No payment processing')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'এই সংস্করণে প্ল্যাটফর্ম ফি, এলসি নিষ্পত্তি বা বাণিজ্যিক পেমেন্ট নেওয়ার ব্যবস্থা নেই।',
              'This version does not collect platform fees, settle letters of credit, or process trade payments.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('নমুনা বাজার প্রোফাইল', 'Illustrative market profiles')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'তালিকার প্রতিষ্ঠান ও বাণিজ্যিক তথ্য নমুনা। এগুলো যাচাইকৃত ক্রেতা, সক্রিয় যোগাযোগ বা আমদানি রেকর্ড নয়।',
              'Company names and commercial details in the directory are examples, not verified buyers, active contacts, or import records.'
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bangla">
            {t('চুক্তি আলাদাভাবে সম্পন্ন করুন', 'Contracts are completed separately')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
            {t(
              'এই প্ল্যাটফর্ম কোনো চুক্তির পক্ষ নয় এবং সালিশ বা বিরোধ নিষ্পত্তির সেবা দেয় না। চুক্তির শর্ত সংশ্লিষ্ট পক্ষ ও তাদের পরামর্শকের সঙ্গে ঠিক করুন।',
              'The platform is not a party to your contract and does not provide arbitration or dispute resolution. Agree on contract terms with the other party and your advisers.'
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
                'এক্সপোর্টপাইলট এআই পণ্যের তথ্য গুছানো, প্রাথমিক HS কোড ও বাজার-রেফারেন্স দেখা, বিদ্যুৎ বিল থেকে নির্গমনের হিসাব করা এবং বাণিজ্যিক নথির খসড়া তৈরিতে সহায়তা করে। এটি বায়ারের সঙ্গে যোগাযোগ স্থাপন বা চুক্তি সম্পন্ন করে না।',
                'ExportPilot AI helps organize product details, review suggested HS codes and market references, estimate emissions from utility bills, and prepare commercial document drafts. It does not connect you to buyers or complete contracts.'
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
                'পণ্যের বিবরণ, ছবি, উৎপাদন ও বিদ্যুৎ ব্যবহারের তথ্য সঠিক কি না যাচাই করে দিন। ব্যক্তিগত বা গোপন নথি কেবল প্রয়োজন হলে আপলোড করুন।',
                'Check that product, production, and utility details are accurate. Upload personal or confidential documents only when needed.'
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
                'প্ল্যাটফর্মে তৈরি দর, ইনভয়েস বা বার্তার খসড়া কোনো বায়ার গ্রহণ করেনি। মূল্য, পেমেন্ট পদ্ধতি ও চালানের শর্ত সংশ্লিষ্ট পক্ষের সঙ্গে যাচাই করে আলাদাভাবে ঠিক করুন।',
                'A price, invoice, or message draft created here has not been accepted by a buyer. Confirm the price, payment method, and shipment terms with the other party separately.'
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
                'এই প্ল্যাটফর্ম কাস্টমস কর্তৃপক্ষ, আইনজীবী, নিরীক্ষক, ব্যাংক বা পরিবহন সংস্থার বিকল্প নয়। HS কোড, শুল্ক, উৎপত্তির নিয়ম, কার্বন তথ্য ও চালানের শর্ত সরকারি বা যোগ্য পেশাদার উৎসে যাচাই করুন।',
                'This platform is not a substitute for customs authorities, legal counsel, auditors, banks, or shipping providers. Verify HS codes, duties, origin rules, emissions data, and shipment terms with official or qualified sources.'
              )}
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-bangla flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('৫. বাণিজ্যিক চুক্তি ও বিরোধ', '5. Trade contracts and disputes')}</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
            <p>
              {t(
                'প্রকৃত ক্রয়-বিক্রয়, পেমেন্ট ও চালানের চুক্তি প্ল্যাটফর্মের বাইরে সংশ্লিষ্ট পক্ষগুলোর মধ্যে সম্পন্ন হবে। প্রয়োজন হলে স্বাধীন আইনি ও বাণিজ্য পরামর্শ নিন।',
                'Actual sale, payment, and shipment contracts are made outside the platform between the parties. Obtain independent legal or trade advice when needed.'
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
            {t('প্ল্যাটফর্মের ব্যবহার সম্পর্কে জানতে নির্দেশিকা দেখুন।', 'Read the user guide for help using the platform.')}
          </p>
        </div>
        <Link
          to="/docs"
          className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shrink-0 font-bangla"
        >
          <span>{t('ব্যবহার নির্দেশিকা দেখুন', 'Open the user guide')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
