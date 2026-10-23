import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Factory, Globe2, FileText, ShieldCheck, Leaf } from 'lucide-react';

const EXPORT_STAGES = [
  {
    titleBn: 'পণ্যের তথ্য',
    titleEn: 'Product details',
    descriptionBn: 'পণ্যের ছবি, উপাদান, উৎপাদন খরচ এবং মাসিক সক্ষমতা যোগ করুন। সম্ভাব্য এইচএস কোডটি চালানের আগে আপনার কাস্টমস ব্রোকারের সঙ্গে যাচাই করুন।',
    descriptionEn: 'Add product photos, materials, production cost, and monthly capacity. Confirm the suggested tariff code with your customs broker before shipment.',
    icon: Factory,
    pointsBn: ['পণ্যের বিবরণ ও ছবি', 'উৎপাদন সক্ষমতা', 'আনুমানিক খরচ'],
    pointsEn: ['Product description and photo', 'Production capacity', 'Estimated cost']
  },
  {
    titleBn: 'কারখানার বিবরণ',
    titleEn: 'Factory brief',
    descriptionBn: 'বাংলায় উৎপাদন সক্ষমতা, বন্দর, পণ্যের বৈশিষ্ট্য এবং বায়ারের শর্ত বলুন। পাঠানোর আগে তৈরি হওয়া তথ্যগুলো দেখে নিন।',
    descriptionEn: 'Describe your production capacity, port, product details, and buyer requirements in Bangla. Review the captured details before sending.',
    icon: ShieldCheck,
    pointsBn: ['বাংলায় কথা বলুন', 'তথ্য যাচাই করুন', 'প্রয়োজনীয় বিবরণ যোগ করুন'],
    pointsEn: ['Speak in Bangla', 'Review the details', 'Add any missing information']
  },
  {
    titleBn: 'কার্বন তথ্য',
    titleEn: 'Carbon information',
    descriptionBn: 'বিদ্যুৎ বিল ও উৎপাদনের পরিমাণ থেকে প্রতি ইউনিটের আনুমানিক নির্গমন দেখুন। প্রয়োজন হলে বায়ার বা কমপ্লায়েন্স পরামর্শকের সঙ্গে হিসাব যাচাই করুন।',
    descriptionEn: 'Review estimated emissions per unit using your electricity bill and production volume. Confirm the calculation with your buyer or compliance adviser when needed.',
    icon: Leaf,
    pointsBn: ['সঠিক সময়ের বিদ্যুৎ বিল', 'একই সময়ের উৎপাদনের পরিমাণ', 'বায়ারের শর্ত যাচাই'],
    pointsEn: ['Utility bill for the period', 'Production volume for the same period', 'Check buyer requirements']
  },
  {
    titleBn: 'বায়ার ও বাজার',
    titleEn: 'Buyers and markets',
    descriptionBn: 'সম্ভাব্য বায়ার, গন্তব্য বাজার, শুল্কের তথ্য এবং পেমেন্ট শর্ত পর্যালোচনা করুন। সুবিধা পণ্য ও উৎপত্তির নিয়ম অনুযায়ী বদলাতে পারে।',
    descriptionEn: 'Review potential buyers, destination markets, tariff information, and payment terms. Benefits can vary by product and rules of origin.',
    icon: Globe2,
    pointsBn: ['বায়ারের তথ্য যাচাই', 'গন্তব্য বাজার বেছে নিন', 'পেমেন্ট শর্ত তুলনা করুন'],
    pointsEn: ['Check buyer details', 'Choose a destination market', 'Compare payment terms']
  },
  {
    titleBn: 'দর ও রপ্তানি নথি',
    titleEn: 'Pricing and export documents',
    descriptionBn: 'এফওবি দর ও চালানের শর্ত ঠিক করে প্রফর্মা ইনভয়েস তৈরি করুন। পাঠানোর আগে প্রতিষ্ঠানের নাম, পরিমাণ, মূল্য এবং পেমেন্টের তথ্য মিলিয়ে নিন।',
    descriptionEn: 'Set your FOB price and shipment terms, then prepare a proforma invoice. Check company names, quantities, prices, and payment details before sharing.',
    icon: FileText,
    pointsBn: ['এফওবি দর ঠিক করুন', 'চালানের শর্ত লিখুন', 'ইনভয়েস যাচাই করুন'],
    pointsEn: ['Set the FOB price', 'Record shipment terms', 'Review the invoice']
  }
];

export const ArchitectureViewer: React.FC = () => {
  const { t, lang } = useAuth();
  const [activeStage, setActiveStage] = useState(0);
  const stage = EXPORT_STAGES[activeStage];
  const StageIcon = stage.icon;
  const stagePoints = lang === 'bn' ? stage.pointsBn : stage.pointsEn;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 animate-fade-in">
      <header className="max-w-3xl space-y-3">
        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold">
          {t('কারখানা থেকে বায়ার', 'Factory to buyer')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t('রপ্তানির কাজ ধাপে ধাপে সাজান', 'A clear path from factory to export')}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-bangla">
          {t('পণ্যের বিবরণ, বাজার, দর এবং নথি এক জায়গায় দেখে পরবর্তী কাজ ঠিক করুন।', 'Review product details, markets, pricing, and documents in one place.')}
        </p>
      </header>

      <nav aria-label={t('রপ্তানি প্রস্তুতির ধাপ', 'Export preparation stages')} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {EXPORT_STAGES.map((item, index) => {
          const Icon = item.icon;
          const active = index === activeStage;
          return (
            <button
              key={item.titleEn}
              type="button"
              onClick={() => setActiveStage(index)}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold">{t(item.titleBn, item.titleEn)}</span>
            </button>
          );
        })}
      </nav>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <StageIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t(stage.titleBn, stage.titleEn)}</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-bangla">{t(stage.descriptionBn, stage.descriptionEn)}</p>
          </div>
          <ul className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            {stagePoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setActiveStage((activeStage + 1) % EXPORT_STAGES.length)}
            className="btn-primary gap-2"
          >
            <span>{t('পরের ধাপ', 'Next step')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <p className="max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-bangla">
        {t('বাজার, শুল্ক, কার্বন এবং রপ্তানি নথির তথ্য প্রস্তাব তৈরিতে সহায়তা করে। চালানের আগে বায়ার, ব্যাংক এবং কাস্টমস সংক্রান্ত শর্ত যাচাই করুন।', 'Market, tariff, carbon, and document details help prepare a proposal. Confirm buyer, banking, and customs requirements before shipment.')}
      </p>
    </div>
  );
};
