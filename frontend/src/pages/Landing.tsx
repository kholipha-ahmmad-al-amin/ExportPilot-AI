import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import seoConfig from '../../seo.config.json';
import {ArrowRight, TrendingUp, ShieldCheck, Globe, FileText, ChevronRight, UploadCloud} from 'lucide-react';
import { ArchitecturalBackground } from '../components/ArchitecturalBackground';
const TradeCorridorGlobe = React.lazy(() =>
  import('../components/TradeCorridorGlobe').then((m) => ({ default: m.TradeCorridorGlobe }))
);
const TradeCorridorFallback = React.lazy(() =>
  import('../components/TradeCorridorGlobe').then((m) => ({ default: m.TradeCorridorFallback }))
);
import { CanvasErrorBoundary } from '../components/CanvasErrorBoundary';
import { TradeTicker } from '../components/TradeTicker';
import { VoiceGuideButton } from '../components/VoiceGuidePlayer';
const LandingBackgroundCanvas = React.lazy(() =>
  import('../components/LandingBackgroundCanvas').then((m) => ({ default: m.LandingBackgroundCanvas }))
);

export const Landing: React.FC = () => {
  const { user, t, theme } = useAuth();
  const navigate = useNavigate();

  // Selected preset preview in hero
  const [selectedHeroPreset, setSelectedHeroPreset] = useState<string>('preset_jute_bag');

  // Direct Export Margin Calculator State
  const [units, setUnits] = useState<number>(10000);
  const [unitCost, setUnitCost] = useState<number>(180);

  // Dynamic Trade Economics:
  // Local buying houses typically offer ~8% margin over production cost
  // Direct international buyers offer ~30% standard FOB margin over production cost
  // ExportPilot eliminates the middleman spread, recovering 22% additional margin for the factory
  const totalProductionCostBdt = units * unitCost;
  const directGainPct = 0.22;
  const directGainBdt = totalProductionCostBdt * directGainPct;
  const directGainUsd = Math.round(directGainBdt / 120);
  const directGainLakhBdt = (directGainBdt / 100000).toFixed(2);

  const presets = [
    {
      id: 'preset_jute_bag',
      title: t('সাভার গোল্ডেন জুট ব্যাগ', 'Savar Golden Jute Bag'),
      sector: t('পাট ও পরিবেশবান্ধব পণ্য', 'Jute & Natural Fiber'),
      hs: '4202.22.10',
      img: '/assets/samples/jute-tote-bag.png',
      fob: '$3.40',
      markets: 'Germany, Japan (0% Duty)',
      co2: '0.31 kg CO2e',
      margin: '+36.5%',
      buyerName: 'NordicEco Retail GmbH (Hamburg)',
      benefit: t('ইউরোপে শুল্কমুক্ত ০% প্রবেশের সুবিধা', 'Zero tariff entry to EU under EBA')
    },
    {
      id: 'preset_denim_jacket',
      title: t('গাজীপুর রিসাইকেলড ডেনিম', 'Gazipur Recycled Denim'),
      sector: t('তৈরি পোশাক ও টেক্সটাইল', 'RMG & Circular Denim'),
      hs: '6201.40.10',
      img: '/assets/samples/denim-jacket-rmg.png',
      fob: '$13.80',
      markets: 'UK (DCTS), Sweden (0% EBA)',
      co2: '2.15 kg CO2e',
      margin: '+34.8%',
      buyerName: 'Thames Streetwear Collective (London)',
      benefit: t('যুক্তরাজ্যে ০% শুল্কমুক্ত রপ্তানি', 'Duty-free export to United Kingdom')
    },
    {
      id: 'preset_leather_boot',
      title: t('সাভার লেদার চেলসি বুট', 'Savar Leather Chelsea Boot'),
      sector: t('চামড়া ও ফুটওয়্যার', 'Leather & Footwear'),
      hs: '6403.91.60',
      img: '/assets/samples/leather-chelsea-boot.png',
      fob: '$24.50',
      markets: 'Italy, Japan (Saves 21.6% Quota)',
      co2: '3.40 kg CO2e',
      margin: '+37.1%',
      buyerName: 'Milano Calzature SpA (Milan)',
      benefit: t('জাপানে ২১.৬% লেদার কোটা শুল্ক সাশ্রয়', 'Saves 21.6% leather quota in Japan')
    },
    {
      id: 'preset_terracotta',
      title: t('বগুড়া সিরামিক টেবিলওয়্যার', 'Bogura Terracotta Tableware'),
      sector: t('সিরামিক ও হস্তশিল্প', 'Ceramic & Tableware'),
      hs: '6912.00.20',
      img: '/assets/samples/terracotta-tableware.png',
      fob: '$11.20',
      markets: 'UAE (Dubai), Germany (0% Duty)',
      co2: '1.15 kg CO2e',
      margin: '+44.2%',
      buyerName: 'Bayern Craft Imports AG (Munich)',
      benefit: t('মধ্যপ্রাচ্য ও ইউরোপে প্রিমিয়াম এফওবি রেট', 'Premium FOB pricing in Middle East & EU')
    }
  ];

  const currentHeroItem = presets.find(p => p.id === selectedHeroPreset) || presets[0];

  const handleLaunchPreset = (presetId: string) => {
    if (user) {
      navigate(`/dealroom?preset=${presetId}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/dealroom?preset=${presetId}`)}`);
    }
  };

  return (
    <div className="relative space-y-28 py-12 sm:py-16 transition-colors duration-200">
      {/* Ambient 3D background: container tiles on an architectural grid */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <CanvasErrorBoundary>
          <React.Suspense fallback={null}>
            <LandingBackgroundCanvas theme={theme === 'dark' ? 'dark' : 'light'} />
          </React.Suspense>
        </CanvasErrorBoundary>
      </div>
      <div className="relative z-10">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. WELCOMING HUMAN HERO SECTION (MARITIME TRADE CORRIDOR GLOBE)    */}
      {/* ------------------------------------------------------------------ */}
      <section id="corridor" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 overflow-hidden scroll-mt-20">
        <ArchitecturalBackground />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (7 cols): Clear & Friendly Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-300 text-xs font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('জাতীয় রপ্তানি বাণিজ্য সহায়তা প্ল্যাটফর্ম', 'National Export Assistance Platform')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2] font-bangla">
              {t(
                'কারখানা থেকে সরাসরি বিশ্ববাজারে রপ্তানি',
                'Export Directly from Factory to Global Markets'
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-bangla max-w-2xl">
              {t(
                'সাভার, গাজীপুর, বগুড়া, চট্টগ্রামসহ বাংলাদেশের কারখানার জন্য ExportPilot AI পণ্যের তথ্য গুছিয়ে HS কোড গবেষণা, বায়ারের চাহিদা, কার্বনের প্রাথমিক হিসাব ও রপ্তানি কাগজপত্র পর্যালোচনায় সহায়তা করে। চূড়ান্ত শুল্ক, কমপ্লায়েন্স ও চুক্তির শর্ত চালানের আগে সংশ্লিষ্ট পক্ষের সঙ্গে নিশ্চিত করুন।',
                'ExportPilot AI helps manufacturers in Savar, Gazipur, Bogura, Chattogram, and other regions prepare product information for export. Teams can review HS code research, buyer requirements, estimated carbon data, and draft trade documents in one workspace. Confirm tariff eligibility, compliance rules, and contract terms with the relevant authorities and counterparties before shipment.'
              )}
            </p>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={user ? "/dealroom" : "/login?redirect=/dealroom"}
                className="btn-primary text-sm py-3.5 px-6 shadow-md flex items-center"
              >
                <span>{user ? t('ডিল রুম খুলুন', 'Open Deal Room') : t('ডিল রুম চালু করুন', 'Launch Deal Room')}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                to="/buyers"
                className="btn-secondary text-sm py-3.5 px-5"
              >
                <span>{t('বায়ারদের তালিকা দেখুন', 'Browse Importers')}</span>
                <ChevronRight className="w-4 h-4 ml-1 text-slate-500" />
              </Link>

              <Link
                to="/docs"
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-300 underline underline-offset-4 px-2 transition-colors font-bangla"
              >
                {t('সহজ নির্দেশিকা পড়ুন', 'Read User Guide')}
              </Link>

              <VoiceGuideButton trackKey="landing_hero" />
            </div>

            {/* Reassuring Data Privacy Banner */}
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="leading-relaxed font-bangla">
                <strong className="text-slate-900 dark:text-slate-200">{t('আপনার তথ্য সম্পূর্ণ সুরক্ষিত:', '100% Data Sovereignty:')}</strong>{' '}
                {t(
                  'বাণিজ্য পরামর্শে পাঠানোর আগে পরিচিত পরিচয় ও কর নম্বর আড়াল করা হয়। ভয়েস দিলে রেকর্ডিং আগে কথায় রূপান্তর করা হয়।',
                  'Known identity and tax numbers are masked before trade advice is requested. Voice recordings are sent for transcription first.'
                )}
              </p>
            </div>

          </div>

          {/* Right Column (5 cols): Interactive Maritime Corridor Globe + Deal Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/90 overflow-hidden h-[380px] sm:h-[420px] shadow-sm">
              <CanvasErrorBoundary>
                <React.Suspense
                  fallback={
                    <div className="w-full h-full">
                      <TradeCorridorFallback />
                    </div>
                  }
                >
                  <TradeCorridorGlobe theme={theme === 'dark' ? 'dark' : 'light'} />
                </React.Suspense>
              </CanvasErrorBoundary>
            </div>
            <div className="card-institutional space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-bangla">
                    {t('লাইভ এক্সপোর্ট ডিল ডেমো', 'Live Export Deal Demo')}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {t('প্রস্তুত ডিল', 'Ready Deal')}
                </span>
              </div>

              {/* Preset Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {presets.map((p) => {
                  const isActive = p.id === selectedHeroPreset;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedHeroPreset(p.id)}
                      className={`py-1.5 px-1 rounded text-[11px] font-semibold transition-all truncate text-center ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.id === 'preset_jute_bag' && t('পাট', 'Jute')}
                      {p.id === 'preset_denim_jacket' && t('ডেনিম', 'Denim')}
                      {p.id === 'preset_leather_boot' && t('লেদার', 'Leather')}
                      {p.id === 'preset_terracotta' && t('সিরামিক', 'Craft')}
                    </button>
                  );
                })}
              </div>

              {/* Active Deal Preview Content */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentHeroItem.img}
                    alt={currentHeroItem.title}
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                      {currentHeroItem.sector}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate font-bangla">
                      {currentHeroItem.title}
                    </h3>
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      HS {currentHeroItem.hs}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{t('নমুনা বাজার প্রোফাইল:', 'Illustrative market profile:')}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                      {currentHeroItem.buyerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{t('শুল্কের রেফারেন্স:', 'Tariff reference:')}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {currentHeroItem.benefit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{t('নমুনা FOB দর:', 'Illustrative FOB price:')}</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {currentHeroItem.fob} USD / pc
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{t('নমুনা মার্জিন হিসাব:', 'Illustrative margin estimate:')}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {currentHeroItem.margin}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-bangla">
                {t('এটি নমুনা পরিস্থিতি। এখানে কোনো বায়ার যোগাযোগ, প্রকৃত অর্ডার বা শুল্কের নিশ্চয়তা দেখানো হচ্ছে না।', 'Sample scenario only. It does not show a buyer inquiry, actual order, or guaranteed tariff.')}
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleLaunchPreset(currentHeroItem.id)}
                  className="w-full btn-primary text-xs py-3 justify-center flex items-center shadow-sm"
                >
                  <span className="font-bangla">{t('এই পণ্যটি দিয়ে ডিল টেস্ট করুন', 'Test This Deal in Deal Room')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Live Trade Ticker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TradeTicker />
      </div>

      {/* ------------------------------------------------------------------ */
      /* 2. THREE-STEP SIMPLE WORKFLOW (#how-it-works)                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {t('সরল প্রক্রিয়া', 'Simple Workflow')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('৩টি সহজ ধাপে কারখানা থেকে সরাসরি আন্তর্জাতিক রপ্তানি', 'Direct International Export in 3 Simple Steps')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla">
            {t(
              'কোনো মধ্যস্থতাকারী বায়িং হাউস ছাড়াই কারখানা থেকেই সম্পন্ন করুন সম্পূর্ণ আন্তর্জাতিক এক্সপোর্ট প্রসেস।',
              'Prepare key export details and work directly with potential buyers.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-institutional space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
              <UploadCloud className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
              {t('ছবি তুলুন বা মুখে বলুন', 'Upload Photo or Speak in Bangla')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
              {t(
                'মোবাইলে পণ্যের ছবি তুলুন অথবা বাংলায় পণ্যের বিবরণ বলুন।',
                'Upload a product photo or describe it in spoken Bangla.'
              )}
            </p>
          </div>

          <div className="card-institutional space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
              <Globe className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
              {t('সম্ভাব্য বাজার ও শুল্কের তথ্য পর্যালোচনা', 'Review Potential Markets and Tariff References')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
              {t(
                'প্রাথমিক HS কোড, নমুনা বাজার প্রোফাইল ও শুল্কের রেফারেন্স দেখুন। চূড়ান্ত শ্রেণিবিন্যাস ও শুল্ক কাস্টমস বা যোগ্য পরামর্শকের সঙ্গে যাচাই করুন।',
                'Review suggested HS codes, illustrative market profiles, and tariff references. Confirm final classification and duties with customs or a qualified adviser.'
              )}
            </p>
          </div>

          <div className="card-institutional space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
              {t('প্রফরমা ইনভয়েস ও চুক্তি প্রস্তুত', 'Download Proforma Invoice & Export Agreement')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
              {t(
                'প্রফর্মা ইনভয়েস ও বায়ার বার্তার খসড়া তৈরি করুন। পাঠানোর আগে শর্ত ও তথ্য যাচাই করুন।',
                'Prepare proforma invoice and buyer message drafts. Review all terms and details before sharing.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. DIRECT EXPORT MARGIN ESTIMATOR (#calculator)                    */}
      {/* ------------------------------------------------------------------ */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="card-institutional space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla">
                  {t('সরাসরি রপ্তানি লাভ ক্যালকুলেটর', 'Direct Export Profit Estimator')}
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
                {t(
                  'চালানের পরিমাণ ও উৎপাদন খরচ দিয়ে সম্ভাব্য বাড়তি আয় হিসাব করুন।',
                  'Estimate the additional earnings from your shipment volume and unit cost.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <VoiceGuideButton trackKey="calculator" />
              <div className="text-left sm:text-right p-4 rounded-xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-mono text-emerald-800 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                  {t('চালানপ্রতি সম্ভাব্য বাড়তি আয়', 'Estimated Earnings Recovered Per Shipment')}
                </span>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                  +${directGainUsd.toLocaleString()} USD
                </div>
                <div className="text-xs text-emerald-800 dark:text-slate-300 font-bangla">
                  (+{directGainLakhBdt} {t('লাখ টাকা বাড়তি মার্জিন', 'Lakh BDT recovered')})
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-bangla">{t('চালানের পরিমাণ (পিস)', 'Shipment Volume (Units)')}</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">{(units || 0).toLocaleString()} pcs</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-950 rounded-lg"
                aria-label="Shipment Volume Slider"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-bangla">{t('ইউনিট প্রতি উৎপাদন খরচ (টাকা)', 'Factory Unit Cost (BDT)')}</span>
                <span className="font-mono text-amber-700 dark:text-amber-400 tabular-nums">{unitCost} BDT</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-950 rounded-lg"
                aria-label="Production Cost Slider"
              />
            </div>
          </div>

          {/* Comparative Economics Footnote */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-bangla">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>{t('লোকাল বায়িং হাউজ মার্জিন: ৮%', 'Buying House Margin: ~8%')}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{t('সরাসরি আন্তর্জাতিক FOB: ৩০%', 'Direct International FOB: ~30%')}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('কারখানার বাড়তি মার্জিন: +২২% সরাসরি সাশ্রয়', 'Factory Gain: +22% recovered margin')}</span>
            </div>
          </div>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 font-bangla">
            {t('এই ক্যালকুলেটরটি নমুনা হিসাব দেখায়। প্রকৃত লাভ পণ্যের খরচ, দর, চালান ও চুক্তির শর্ত অনুযায়ী বদলাবে।', 'Illustrative estimate only. Actual returns depend on production cost, price, shipment, and contract terms.')}
          </p>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. FLAGSHIP NATIONAL SECTORS (#sectors)                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="sectors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              {t('শীর্ষ পণ্যসমূহ', 'Top Export Products')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('বাংলাদেশের ৪টি শীর্ষ জাতীয় রপ্তানি পণ্য', 'Bangladesh 4 National Flagship Export Sectors')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla max-w-2xl">
              {t(
                'তৈরি পোশাক, পাট, চামড়া ও সিরামিকসহ বাংলাদেশের পরিচিত রপ্তানি খাতের পণ্য তথ্য এক জায়গায় গুছিয়ে নিন। গন্তব্য অনুযায়ী শুল্ক ও কমপ্লায়েন্সের শর্ত যাচাই করুন।',
                'Organize product details for common Bangladesh export sectors, including garments, jute, leather, and ceramics. Review tariff eligibility and compliance requirements for each destination.'
              )}
            </p>
          </div>

          <Link
            to="/buyers"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 font-bangla"
          >
            <span>{t('সম্পূর্ণ বায়ার ডিরেক্টরি দেখুন', 'Browse Full Buyer Directory')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Sector Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {presets.map((p) => (
            <div
              key={p.id}
              className="card-institutional card-institutional-hover flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img
                    src={p.img}
                    alt={p.title}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold shadow-sm">
                    {p.fob} FOB
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-500">{p.sector}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bangla leading-snug">
                    {p.title}
                  </h3>
                  <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    HS {p.hs}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>{t('প্রধান বাজার:', 'Target Markets:')}</span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium">{p.markets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('কার্বন স্কোর:', 'Carbon Footprint:')}</span>
                    <span className="text-slate-800 dark:text-slate-300 font-mono">{p.co2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('মার্জিন লাভ:', 'Margin Gain:')}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{p.margin}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchPreset(p.id)}
                className="w-full btn-secondary text-xs py-2.5 justify-center font-bangla shadow-sm"
              >
                {t('ডিল রুমে লোড করুন', 'Open in Deal Room')}
              </button>
            </div>
          ))}
        </div>

      </section>

      <section id="export-faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        <header className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-bangla">
            {t('রপ্তানি প্রস্তুতি নিয়ে সাধারণ প্রশ্ন', 'Export preparation questions')}
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 font-bangla">
            {t('শুল্ক, উৎপত্তির নিয়ম ও কমপ্লায়েন্স চালানের আগে সংশ্লিষ্ট কর্তৃপক্ষ ও বায়ারের সঙ্গে যাচাই করুন।', 'Confirm tariffs, origin rules, and compliance requirements with the relevant authorities and buyer before shipment.')}
          </p>
        </header>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {seoConfig.homeFaqs.map((faq) => (
            <details key={faq.questionEn} className="group py-5">
              <summary className="cursor-pointer list-none pr-6 text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 font-bangla marker:hidden">
                {t(faq.questionBn, faq.questionEn)}
              </summary>
              <p className="pt-3 text-sm leading-7 text-slate-700 dark:text-slate-300 font-bangla">
                {t(faq.answerBn, faq.answerEn)}
              </p>
            </details>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/savar">{t('সাভার', 'Savar')}</Link>
          <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/gazipur">{t('গাজীপুর', 'Gazipur')}</Link>
          <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/bogura">{t('বগুড়া', 'Bogura')}</Link>
          <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/locations/chattogram">{t('চট্টগ্রাম', 'Chattogram')}</Link>
          <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/features/hs-classification">{t('HS কোড গবেষণা', 'HS code research')}</Link>
          <Link className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" to="/features/export-documents">{t('রপ্তানি কাগজপত্র', 'Export documents')}</Link>
        </div>
      </section>

    </div>
    </div>
  );
};
