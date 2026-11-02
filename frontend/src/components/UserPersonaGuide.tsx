import React, { useState } from 'react';
import {useAuth} from '../context/AuthContext';
import {ChevronDown, ChevronUp, UserCheck, ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';

export interface PersonaInfo {
  roleId: string;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  keyWorkflowsBn: string[];
  keyWorkflowsEn: string[];
  primaryLink: string;
  primaryLinkTextBn: string;
  primaryLinkTextEn: string;
}

export const USER_PERSONAS: PersonaInfo[] = [
  {
    roleId: 'exporter',
    badgeBn: 'রপ্তানিকারক',
    badgeEn: 'Exporter',
    titleBn: 'এসএমই কারখানা মালিক ও রপ্তানিকারক',
    titleEn: 'SME Factory Owner & Exporter',
    subtitleBn: 'তৈরি পোশাক, পাট, চামড়া, সিরামিক ও কৃষি প্রক্রিয়াকরণ কারখানা',
    subtitleEn: 'RMG, Jute, Leather, Ceramics & Agro-processing SME Mills',
    descriptionBn: 'পণ্যের তথ্য গুছিয়ে সম্ভাব্য বাজার দেখুন, কার্বন হিসাব পর্যালোচনা করুন এবং রপ্তানি নথির খসড়া তৈরি করুন।',
    descriptionEn: 'Organize product details, review potential markets and carbon estimates, and prepare export document drafts.',
    keyWorkflowsBn: [
      'পণ্যের তথ্য ও প্রাথমিক HS কোডের পরামর্শ পর্যালোচনা',
      'বিদ্যুৎ বিল বা নমুনা তথ্য থেকে Scope 2 কার্বন হিসাব দেখা',
      'নমুনা বাজার প্রোফাইল দেখে বার্তা ও বাণিজ্যিক শর্তের খসড়া সংরক্ষণ'
    ],
    keyWorkflowsEn: [
      'Review product details and suggested HS codes',
      'Review Scope 2 estimates from a bill or sample inputs',
      'Review illustrative market profiles and save message or term-sheet drafts'
    ],
    primaryLink: '/app',
    primaryLinkTextBn: 'ডিল রুমে প্রবেশ করুন',
    primaryLinkTextEn: 'Enter Deal Room'
  },
  {
    roleId: 'buyer',
    badgeBn: 'বায়ার অ্যাকাউন্ট',
    badgeEn: 'Buyer Account',
    titleBn: 'বায়ার অ্যাকাউন্টের তথ্য',
    titleEn: 'Buyer Account Information',
    subtitleBn: 'বায়ার ও কমপ্লায়েন্স অ্যাকাউন্ট প্রশাসকের অনুমোদনে চালু হয়',
    subtitleEn: 'Buyer and compliance accounts are assigned by an administrator',
    descriptionBn: 'এই সংস্করণে বায়ারদের জন্য সরবরাহকারী ডিরেক্টরি, ইনবক্স বা সরাসরি যোগাযোগ চালু নেই।',
    descriptionEn: 'The current version does not provide buyers with a supplier directory, inbox, or direct contact service.',
    keyWorkflowsBn: [
      'বায়ার অ্যাকাউন্ট প্রশাসকের অনুমোদনে চালু হয়',
      'সরবরাহকারী তালিকা ও ইনবক্স এখনো উপলভ্য নয়',
      'নমুনা বাজার প্রোফাইলকে যাচাইকৃত সরবরাহকারী হিসেবে ব্যবহার করবেন না'
    ],
    keyWorkflowsEn: [
      'Buyer accounts require administrator approval',
      'Supplier listings and a buyer inbox are not available yet',
      'Do not treat sample profiles as verified suppliers'
    ],
    primaryLink: '/login',
    primaryLinkTextBn: 'অ্যাকাউন্টে প্রবেশ করুন',
    primaryLinkTextEn: 'Sign in'
  },
  {
    roleId: 'auditor',
    badgeBn: 'অডিটর ও কনসালটেন্ট',
    badgeEn: 'Auditor & Advisor',
    titleBn: 'কমপ্লায়েন্স অডিটর ও ট্রেড পলিসি পরামর্শক',
    titleEn: 'Compliance Auditor & Trade Advisor',
    subtitleBn: 'সার্টিফিকেশন বডি, বাণিজ্য পরিষদ ও রপ্তানি উন্নয়ন কনসালটেন্ট',
    subtitleEn: 'Accreditation Bodies, Trade Councils & Export Policy Specialists',
    descriptionBn: 'কারখানার স্কোপ ২ কার্বন নিঃসরণ (কেজি CO2e প্রতি ইউনিট), জাতীয় গ্রিড এমিশন ফ্যাক্টর এবং পরিবেশগত ও শ্রম মানদণ্ড নিরীক্ষা করুন। আন্তর্জাতিক বাণিজ্য চুক্তি ও ট্যারিফ পরিবর্তনের প্রভাব বিশ্লেষণ করুন।',
    descriptionEn: 'Audit factory Scope 2 greenhouse gas emissions (kg CO2e per unit) against national grid emission factors and international standards. Analyze the commercial impact of preferential tariff schemes.',
    keyWorkflowsBn: [
      'ইউরোপীয় ইউনিয়নের সিবিএএম মানদণ্ড অনুযায়ী গ্রিড কার্বন নিঃসরণ মূল্যায়ন',
      '১০০-পয়েন্ট সিস্টেম অডিট রিপোর্ট এবং স্থানীয় সার্বভৌম ডেটা নিরাপত্তা যাচাই',
      'সার্বভৌম ট্রেড অ্যাডভাইজার এআই এর মাধ্যমে কাউন্টার-অফার ও ঝুঁকি বিশ্লেষণ'
    ],
    keyWorkflowsEn: [
      'Evaluate grid electricity carbon emissions against EU CBAM industrial benchmarks',
      'Review 100-point full-stack security and compliance verification report',
      'Assess multilateral negotiation risks and counter-offer recommendations via Trade Advisor'
    ],
    primaryLink: '/audit',
    primaryLinkTextBn: 'অডিট রিপোর্ট দেখুন',
    primaryLinkTextEn: 'View Audit Report'
  },
  {
    roleId: 'admin',
    badgeBn: 'সুপারইউজার',
    badgeEn: 'Superuser',
    titleBn: 'প্ল্যাটফর্ম অ্যাডমিন ও পলিসি অ্যানালিস্ট',
    titleEn: 'Platform Superuser & System Admin',
    subtitleBn: 'জাতীয় রপ্তানি তদারকি ও সার্বভৌম ডেটা নিরাপত্তা ব্যবস্থাপনা',
    subtitleEn: 'National Export Monitoring & Sovereign Data Infrastructure Operations',
    descriptionBn: 'ব্যবহারকারীর অ্যাকাউন্ট, তথ্যের গোপনীয়তা এবং বাণিজ্য কার্যক্রমের অবস্থা দেখুন।',
    descriptionEn: 'Review user accounts, information privacy, and trade activity.',
    keyWorkflowsBn: [
      'ব্যবহারকারীর অ্যাকাউন্ট ও প্রবেশাধিকার পরিচালনা',
      'তথ্য সুরক্ষা ও নিরীক্ষার রেকর্ড পর্যালোচনা',
      'বাণিজ্য কার্যক্রমের সার্বিক অবস্থা দেখা'
    ],
    keyWorkflowsEn: [
      'Manage user accounts and workspace access',
      'Review privacy controls and audit records',
      'Monitor overall trade activity'
    ],
    primaryLink: '/admin',
    primaryLinkTextBn: 'অ্যাডমিন প্যানেলে যান',
    primaryLinkTextEn: 'Open Admin Panel'
  }
];

export const UserPersonaGuide: React.FC = () => {
  const { t, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('exporter');

  const selectedPersona = USER_PERSONAS.find(p => p.roleId === activeTab) || USER_PERSONAS[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-md dark:shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('প্ল্যাটফর্মের ৪ ধরনের ব্যবহারকারী ও ব্যবহারের সুনির্দিষ্ট গাইড', 'Platform 4 User Personas & Operational Guide')}
              </h2>
              <span className="badge badge-em text-[10px] font-mono">
                {t('৪টি সুনির্দিষ্ট রোল', '4 Defined Personas')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla mt-0.5">
              {t(
                'রপ্তানিকারক, আন্তর্জাতিক বায়ার, অডিটর ও অ্যাডমিন কার ড্যাশবোর্ড থেকে কী সুবিধা পাবেন তা জানুন।',
                'Understand specific features, permissions, and daily operations for each user type.'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5 self-end sm:self-auto font-bangla"
        >
          <span>{isExpanded ? t('সংক্ষেপ করুন', 'Collapse') : t('বিস্তারিত গাইড দেখুন', 'Explore Roles')}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Persona Selection Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {USER_PERSONAS.map((persona) => {
              const isSelected = activeTab === persona.roleId;
              const isUserCurrentRole = user?.role?.toLowerCase() === persona.roleId;

              return (
                <button
                  key={persona.roleId}
                  type="button"
                  onClick={() => setActiveTab(persona.roleId)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500/80 dark:bg-emerald-950/60 dark:border-emerald-500/80 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-950/60 dark:border-slate-800/80 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isSelected ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {t(persona.badgeBn, persona.badgeEn)}
                    </span>
                    {isUserCurrentRole && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Your Role" />
                    )}
                  </div>
                  <div className={`text-xs font-bold font-bangla truncate ${
                    isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {t(persona.titleBn, persona.titleEn)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Persona Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="badge badge-em font-mono text-[10px] mb-1 inline-block">
                  {t(selectedPersona.badgeBn, selectedPersona.badgeEn)}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                  {t(selectedPersona.titleBn, selectedPersona.titleEn)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla mt-0.5">
                  {t(selectedPersona.subtitleBn, selectedPersona.subtitleEn)}
                </p>
              </div>

              <Link
                to={selectedPersona.primaryLink}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto font-bangla shadow-md shadow-emerald-500/20 shrink-0"
              >
                <span>{t(selectedPersona.primaryLinkTextBn, selectedPersona.primaryLinkTextEn)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-bangla">
              {t(selectedPersona.descriptionBn, selectedPersona.descriptionEn)}
            </p>

            {/* Key Workflows */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">
                {t('প্রধান কাজের ক্ষেত্রসমূহ:', 'Primary Operational Workflows:')}
              </span>
              <ul className="space-y-2">
                {selectedPersona.keyWorkflowsBn.map((itemBn, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bangla">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{t(itemBn, selectedPersona.keyWorkflowsEn[idx])}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
