import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Anchor,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Leaf,
  MapPin,
  Percent
} from 'lucide-react';

export interface LogisticsCorridor {
  id: string;
  nameBn: string;
  nameEn: string;
  countryBn: string;
  countryEn: string;
  flag: string;
  sectorKey: 'jute' | 'rmg' | 'leather' | 'ceramics';
  sectorBn: string;
  sectorEn: string;
  presetId: string;
  transitDays: number;
  feederPortBn: string;
  feederPortEn: string;
  mainlineRouteBn: string;
  mainlineRouteEn: string;
  tariffSchemeBn: string;
  tariffSchemeEn: string;
  bangladeshDuty: string;
  competitorDuty: string;
  competitorNamesBn: string;
  competitorNamesEn: string;
  carbonBunker: string;
  carbonSavings: string;
  cashIncentiveBn: string;
  cashIncentiveEn: string;
  freightEstimate: string;
  primaryGoodsBn: string;
  primaryGoodsEn: string;
  carriers: string[];
}

export const LOGISTICS_CORRIDORS: LogisticsCorridor[] = [
  {
    id: 'corridor-rotterdam',
    nameBn: 'রটারডাম / হামবুর্গ বন্দর',
    nameEn: 'Port of Rotterdam / Hamburg',
    countryBn: 'ইউরোপীয় ইউনিয়ন (নেদারল্যান্ডস ও জার্মানি)',
    countryEn: 'European Union (Netherlands & Germany)',
    flag: 'EU',
    sectorKey: 'jute',
    sectorBn: 'বহুমুখী পাট ও পরিবেশবান্ধব পণ্য',
    sectorEn: 'Diversified Jute & Natural Fiber',
    presetId: 'preset_jute_bag',
    transitDays: 22,
    feederPortBn: 'কলম্বো / সিঙ্গাপুর ট্রান্সশিপমেন্ট হাব (৩ দিন)',
    feederPortEn: 'Colombo / Singapore Transshipment Hub (3 days)',
    mainlineRouteBn: 'সুয়েজ খাল -> ভূমধ্যসাগর -> জিব্রাল্টার প্রণালী -> রটারডাম',
    mainlineRouteEn: 'Suez Canal -> Mediterranean -> Strait of Gibraltar -> Rotterdam',
    tariffSchemeBn: 'EU Everything But Arms (EBA) স্কিম',
    tariffSchemeEn: 'EU Everything But Arms (EBA) Scheme',
    bangladeshDuty: '০.০% (সম্পূর্ণ শুল্কমুক্ত)',
    competitorDuty: '৯.৬% MFN স্ট্যান্ডার্ড শুল্ক',
    competitorNamesBn: 'ভারত ও ভিয়েতনামের প্রতিযোগী রপ্তানিকারক',
    competitorNamesEn: 'Competitors from India & Vietnam',
    carbonBunker: '০.১৮ কেজি CO2e / টিইইউ-কিমি',
    carbonSavings: 'ইউরোপীয় ইউনিয়ন CBAM কার্বন থ্রেশহোল্ড কমপ্লায়েন্ট',
    cashIncentiveBn: '২০% সরকারি নগদ সহায়তা (পাটজাত বহুমুখী পণ্য)',
    cashIncentiveEn: '20% National Cash Incentive (Diversified Jute)',
    freightEstimate: '$১,৪৫০ - $১,৬৮০ / FEU',
    primaryGoodsBn: 'পাটজাত শপিং ব্যাগ, এসকেপ রোল ও বহুমুখী পণ্য',
    primaryGoodsEn: 'Jute shopping bags, yarn bales, and eco-crafts',
    carriers: ['Maersk Line', 'Hapag-Lloyd', 'MSC', 'CMA CGM']
  },
  {
    id: 'corridor-felixstowe',
    nameBn: 'ফেলিক্সস্টো বন্দর (লন্ডন)',
    nameEn: 'Port of Felixstowe (London)',
    countryBn: 'যুক্তরাজ্য (UK)',
    countryEn: 'United Kingdom (UK)',
    flag: 'UK',
    sectorKey: 'rmg',
    sectorBn: 'তৈরি পোশাক ও রিসাইকেলড ডেনিম',
    sectorEn: 'Ready-Made Garments & Recycled Denim',
    presetId: 'preset_denim_jacket',
    transitDays: 24,
    feederPortBn: 'সিঙ্গাপুর পোর্ট হাব (৪ দিন)',
    feederPortEn: 'Port of Singapore Hub (4 days)',
    mainlineRouteBn: 'মালাক্কা প্রণালী -> লোহিত সাগর -> জিব্রাল্টার -> ফেলিক্সস্টো',
    mainlineRouteEn: 'Strait of Malacca -> Red Sea -> Gibraltar -> Felixstowe',
    tariffSchemeBn: 'UK Developing Countries Trading Scheme (DCTS)',
    tariffSchemeEn: 'UK Developing Countries Trading Scheme (DCTS)',
    bangladeshDuty: '০.০% (সম্পূর্ণ শুল্কমুক্ত সুবিধা)',
    competitorDuty: '১২.০% সাধারণ শুল্ক',
    competitorNamesBn: 'তুরস্ক ও পাকিস্তানের পোশাক রপ্তানিকারক',
    competitorNamesEn: 'Competitors from Turkey & Pakistan',
    carbonBunker: '০.২০ কেজি CO2e / টিইইউ-কিমি',
    carbonSavings: 'সাসটেইনেবল কটন ও রিসাইকেলড ফাইবারে ২০% কার্বন সাশ্রয়',
    cashIncentiveBn: '৪% বিশেষ নগদ সহায়তা (পোশাক খাত)',
    cashIncentiveEn: '4% Special Cash Incentive (RMG Sector)',
    freightEstimate: '$১,৫২০ - $১,৭৫০ / FEU',
    primaryGoodsBn: 'রিসাইকেলড ডেনিম জ্যাকেট, সুতি টি-শার্ট ও সোয়েটার',
    primaryGoodsEn: 'Recycled denim jackets, combed cotton tees & knitwear',
    carriers: ['ONE Ocean Network', 'Maersk Line', 'Evergreen Marine', 'MSC']
  },
  {
    id: 'corridor-tokyo',
    nameBn: 'টোকিও / ইয়োকোহামা বন্দর',
    nameEn: 'Port of Tokyo / Yokohama',
    countryBn: 'জাপান (Japan)',
    countryEn: 'Japan',
    flag: 'JP',
    sectorKey: 'leather',
    sectorBn: 'চামড়াজাত জুতা ও ফুটওয়্যার',
    sectorEn: 'Leather Footwear & Goods',
    presetId: 'preset_leather_boot',
    transitDays: 14,
    feederPortBn: 'সিঙ্গাপুর / তানজুং পেলেপাস হাব (২ দিন)',
    feederPortEn: 'Singapore / Tanjung Pelepas Hub (2 days)',
    mainlineRouteBn: 'মালাক্কা প্রণালী -> দক্ষিণ চীন সাগর -> ইস্ট চায়না সি -> টোকিও বে',
    mainlineRouteEn: 'Malacca Strait -> South China Sea -> East China Sea -> Tokyo Bay',
    tariffSchemeBn: 'Japan GSP প্রিফারেন্সিয়াল ট্যারিফ স্কিম',
    tariffSchemeEn: 'Japan GSP Preferential Tariff Scheme',
    bangladeshDuty: '০.০% (কোটা শুল্ক সম্পূর্ণ সাশ্রয়)',
    competitorDuty: '২১.৬% লেদার ট্যারিফ কোটা শুল্ক',
    competitorNamesBn: 'চীন ও মেক্সিকোর ফুটওয়্যার প্রস্তুতকারক',
    competitorNamesEn: 'Footwear manufacturers from China & Mexico',
    carbonBunker: '০.১২ কেজি CO2e / টিইইউ-কিমি',
    carbonSavings: 'ভেজিটেবল-ট্যানড চামড়ায় ক্ষতিকর ক্রোমিয়াম মুক্ত উৎপাদন',
    cashIncentiveBn: '১৫% সরকারি নগদ সহায়তা (চামড়াজাত পণ্য)',
    cashIncentiveEn: '15% National Cash Incentive (Finished Leather Goods)',
    freightEstimate: '$১,১০০ - $১,২৯০ / FEU',
    primaryGoodsBn: 'চেলসি লেদার বুট, চামড়ার ব্যাগ ও বেল্ট',
    primaryGoodsEn: 'Vegetable-tanned Chelsea boots, leather bags & accessories',
    carriers: ['NYK Line / ONE', 'Yang Ming', 'COSCO Shipping', 'Maersk']
  },
  {
    id: 'corridor-newyork',
    nameBn: 'পোর্ট অব নিউ ইয়র্ক ও নিউ জার্সি',
    nameEn: 'Port of New York & New Jersey',
    countryBn: 'যুক্তরাষ্ট্র (USA)',
    countryEn: 'United States of America',
    flag: 'US',
    sectorKey: 'ceramics',
    sectorBn: 'সিরামিক টেবিলওয়্যার ও হস্তশিল্প',
    sectorEn: 'Ceramic Tableware & Stoneware',
    presetId: 'preset_terracotta',
    transitDays: 29,
    feederPortBn: 'কলম্বো হাব (৩ দিন)',
    feederPortEn: 'Colombo Hub (3 days)',
    mainlineRouteBn: 'সুয়েজ খাল -> ভূমধ্যসাগর -> আটলান্টিক মহাসাগর -> নিউ ইয়র্ক',
    mainlineRouteEn: 'Suez Canal -> Mediterranean -> Atlantic Ocean -> New York Harbor',
    tariffSchemeBn: 'সরাসরি ইউএস ডিপার্টমেন্ট স্টোর এফওবি সাপ্লাই',
    tariffSchemeEn: 'Direct US Department Store FOB Supply Contract',
    bangladeshDuty: 'কারখানা-সরাসরি নির্ধারিত FOB দর',
    competitorDuty: 'মিডলম্যান চার্জ ১৫% - ২০% কর্তন',
    competitorNamesBn: 'তৃতীয় পক্ষ লোকাল বায়িং হাউস ব্রোকার',
    competitorNamesEn: 'Third-party intermediary buying agents',
    carbonBunker: '০.২৪ কেজি CO2e / টিইইউ-কিমি',
    carbonSavings: 'লেড-ফ্রি ও ফুড-গ্রেড ন্যাচারাল ক্লে সার্টিফাইড',
    cashIncentiveBn: '১০% নগদ সহায়তা (হালকা প্রকৌশল ও সিরামিক)',
    cashIncentiveEn: '10% Cash Incentive (Ceramic & Light Engineering)',
    freightEstimate: '$১,৮৫০ - $২,১৫০ / FEU',
    primaryGoodsBn: 'প্রিমিয়াম সিরামিক ডিনার সেট, টেবিলওয়্যার ও হোম ডেকর',
    primaryGoodsEn: 'Lead-free glazed dinnerware, porcelain sets & home decor',
    carriers: ['Maersk Line', 'CMA CGM', 'Hapag-Lloyd', 'MSC']
  }
];

export const TradeLogisticsRadar: React.FC = () => {
  const { t, lang, user } = useAuth();
  const navigate = useNavigate();
  const [activeCorridorId, setActiveCorridorId] = useState<string>('corridor-rotterdam');

  const active = LOGISTICS_CORRIDORS.find((c) => c.id === activeCorridorId) || LOGISTICS_CORRIDORS[0];

  const handleLaunchCorridorDeal = (presetId: string) => {
    const targetUrl = `/dealroom?preset=${presetId}&corridor=${active.id}`;
    if (user) {
      navigate(targetUrl);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Information */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
          <Anchor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('লজিস্টিকস ও শুল্ক সুবিধা রাডার', 'Logistics & Tariff Advantage Radar')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
          {t('চট্টগ্রাম বন্দর থেকে প্রধান বাণিজ্য করিডোরে সরাসরি রুট ও শুল্ক হিসাব', 'Direct Maritime Corridors, Schedules & Tariff Advantage from Chattogram')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bangla leading-relaxed">
          {t(
            'ইউরোপীয় ইউনিয়ন, যুক্তরাজ্য, জাপান ও মার্কিন যুক্তরাষ্ট্রের বাজারে ট্রানজিট সময়, শূন্য শুল্কের আর্থিক সুবিধা ও সিবিএএম কার্বন সূচক এক নজরে যাচাই করুন।',
            'Review real maritime transit times, duty-free tariff preferences, and CBAM carbon metrics across 4 strategic export corridors.'
          )}
        </p>
      </div>

      {/* 2. Corridor Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {LOGISTICS_CORRIDORS.map((c) => {
          const isSelected = c.id === activeCorridorId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCorridorId(c.id)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              )}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {c.flag}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <Clock className="w-3 h-3" />
                  {c.transitDays} {t('দিন', 'days')}
                </span>
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-bangla truncate">
                  {lang === 'bn' ? c.nameBn : c.nameEn}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bangla truncate mt-0.5">
                  {lang === 'bn' ? c.countryBn : c.countryEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Active Corridor Deep Intelligence Panel */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        
        {/* Destination Header Banner */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-bangla">
                {lang === 'bn' ? active.nameBn : active.nameEn}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {lang === 'bn' ? active.sectorBn : active.sectorEn}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bangla">
              {lang === 'bn' ? active.tariffSchemeBn : active.tariffSchemeEn}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleLaunchCorridorDeal(active.presetId)}
              className="btn-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-2 font-bangla cursor-pointer shrink-0"
            >
              <span>{t('এই করিডোরে ডিল তৈরি করুন', 'Launch Deal in This Corridor')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Institutional Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">

          {/* Left Column (6 cols): Visual Supply Chain Journey */}
          <div className="lg:col-span-6 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">
                  {t('মেরিটাইম ট্রানজিট জার্নি', 'Maritime Transit Journey')}
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {active.transitDays} {t('দিন মোট ট্রানজিট', 'Days Total')}
              </span>
            </div>

            {/* Step-by-Step Route Milestones */}
            <div className="space-y-4 text-xs font-bangla">
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold shrink-0 mt-0.5 text-[11px]">
                  ১
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('চট্টগ্রাম বন্দর (প্রধান রপ্তানি হাব)', 'Chattogram Port (Sovereign Hub)')}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {t('কারখানা থেকে চালান আগমন, কাস্টমস ক্লিয়ারেন্স ও ফিডার ভেসেল লোডিং (Day 0 - 2)', 'Factory cargo arrival, customs clearance & feeder vessel loading (Day 0 - 2)')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0 mt-0.5 text-[11px]">
                  ২
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? active.feederPortBn : active.feederPortEn}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {t('মাদার ভেসেল কানেক্টিভিটি ও গভীর সমুদ্র টার্মিনাল শিফটিং', 'Mother vessel connection and deep-sea terminal transfer')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0 mt-0.5 text-[11px]">
                  ৩
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {t('আন্তর্জাতিক মেইনলাইন সমুদ্র রুট', 'Mainline Sea Corridor')}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {lang === 'bn' ? active.mainlineRouteBn : active.mainlineRouteEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 text-[11px]">
                  ৪
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">
                    {lang === 'bn' ? active.nameBn : active.nameEn}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {t('গন্তব্য বন্দরে খালাস, বায়ার কর্তৃক এল/সি পেমেন্ট গ্রহণ ও ডেলিভারি', 'Destination unloading, buyer L/C payment settlement & cargo handover')}
                  </p>
                </div>
              </div>

            </div>

            {/* Carrier Network */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-bangla">
                {t('প্রধান সক্রিয় শিপিং লাইনসমূহ:', 'Major Active Shipping Lines:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {active.carriers.map((carrier) => (
                  <span
                    key={carrier}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {carrier}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (6 cols): Tariff Advantage & Commercial Economics */}
          <div className="lg:col-span-6 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">
                  {t('শুল্ক সুবিধা ও বাণিজ্যিক লাভ', 'Tariff Preference & Economics')}
                </h4>
              </div>
              <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                {active.freightEstimate}
              </span>
            </div>

            {/* Side-by-side Tariff Differential Box */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold font-bangla">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('বাংলাদেশি পণ্য:', 'Bangladesh Product:')}</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {active.bangladeshDuty}
                </div>
                <div className="text-[10px] text-slate-500 font-bangla">
                  {lang === 'bn' ? active.tariffSchemeBn : active.tariffSchemeEn}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold font-bangla">
                  <span>{t('প্রতিযোগী দেশের শুল্ক:', 'Competitor Tariff:')}</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                  {active.competitorDuty}
                </div>
                <div className="text-[10px] text-slate-500 font-bangla">
                  {lang === 'bn' ? active.competitorNamesBn : active.competitorNamesEn}
                </div>
              </div>

            </div>

            {/* Environmental & Financial Perks */}
            <div className="space-y-2.5 text-xs font-bangla">
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                    {lang === 'bn' ? active.cashIncentiveBn : active.cashIncentiveEn}
                  </span>
                </div>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  BB Circular
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2 min-w-0">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {t('সিবিএএম কার্বন সূচক:', 'CBAM Carbon Index:')} {active.carbonBunker}
                  </span>
                </div>
                <span className="font-mono text-slate-500 text-[11px] shrink-0">
                  EU ETS
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">{t('রপ্তানিযোগ্য প্রধান পণ্য:', 'Primary Export Commodities:')} </strong>
                {lang === 'bn' ? active.primaryGoodsBn : active.primaryGoodsEn}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
