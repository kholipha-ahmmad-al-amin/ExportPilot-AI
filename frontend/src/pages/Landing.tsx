import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import seoConfig from '../../seo.config.json';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Globe,
  FileText,
  ChevronRight,
  UploadCloud,
  Play,
  Clock,
  ChevronDown
} from 'lucide-react';
import { ArchitecturalBackground } from '../components/ArchitecturalBackground';
import { CanvasErrorBoundary } from '../components/CanvasErrorBoundary';
import { TradeTicker } from '../components/TradeTicker';
import { VoiceGuideButton } from '../components/VoiceGuidePlayer';

const TradeCorridorGlobe = React.lazy(() =>
  import('../components/TradeCorridorGlobe').then((m) => ({ default: m.TradeCorridorGlobe }))
);
const TradeCorridorFallback = React.lazy(() =>
  import('../components/TradeCorridorGlobe').then((m) => ({ default: m.TradeCorridorFallback }))
);
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

  // Accordion state for FAQs (prevents native details collapsing layout collisions)
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic Trade Economics
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
      benefit: t('ইউরোপে ইবিএ সুবিধার আওতায় ০% শুল্ক', 'Zero tariff entry to EU under EBA')
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
      benefit: t('জাপানে ২১.৬% লেদার কোটা সাশ্রয় সুবিধা', 'Saves 21.6% leather quota in Japan')
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

  const currentHeroItem = presets.find((p) => p.id === selectedHeroPreset) || presets[0];

  const handleLaunchPreset = (presetId: string) => {
    if (user) {
      navigate(`/dealroom?preset=${presetId}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/dealroom?preset=${presetId}`)}`);
    }
  };

  const handleLaunchCalculator = () => {
    const targetUrl = `/dealroom?preset=${selectedHeroPreset}&units=${units}&cost=${unitCost}`;
    if (user) {
      navigate(targetUrl);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  return (
    <div className="relative space-y-20 sm:space-y-24 py-8 sm:py-16 transition-colors duration-200">
      {/* Ambient 3D background: desktop only with negative z-index to eliminate mobile canvas overlap */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <CanvasErrorBoundary>
          <React.Suspense fallback={null}>
            <LandingBackgroundCanvas theme={theme === 'dark' ? 'dark' : 'light'} />
          </React.Suspense>
        </CanvasErrorBoundary>
      </div>

      <div className="relative z-10 space-y-20 sm:space-y-24">

        {/* ------------------------------------------------------------------ */}
        {/* 1. HERO SECTION (VALUE PROPOSITION + MARITIME CORRIDOR GLOBE)      */}
        {/* ------------------------------------------------------------------ */}
        <section id="corridor" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-6 overflow-hidden scroll-mt-20">
          <ArchitecturalBackground />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column (7 cols): Direct Value Proposition */}
            <div className="lg:col-span-7 space-y-6">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-300 text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('জাতীয় রপ্তানি বাণিজ্য সহায়তা প্ল্যাটফর্ম', 'National Export Assistance Platform')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.18] font-bangla">
                {t(
                  'কারখানা থেকে সরাসরি বিশ্ববাজারে রপ্তানি',
                  'Export Directly from Factory to Global Markets'
                )}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-bangla max-w-2xl">
                {t(
                  'সাভার, গাজীপুর, বগুড়া ও চট্টগ্রামসহ বাংলাদেশের কারখানার জন্য ExportPilot AI পণ্যের তথ্য গুছিয়ে HS কোড গবেষণা, আন্তর্জাতিক বায়ারের চাহিদা, ইউরোপিয়ান সিবিএএম কার্বন হিসাব ও ব্যাংক-রেডি রপ্তানি কাগজপত্র প্রস্তুত করতে সহায়তা করে।',
                  'ExportPilot AI helps manufacturers in Savar, Gazipur, Bogura, Chattogram, and across Bangladesh prepare export intelligence. Review HS code research, direct buyer requirements, CBAM carbon audits, and draft bank-ready documents in one sovereign workspace.'
                )}
              </p>

              {/* Direct Action Buttons with Video CTA */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <Link
                  to={user ? "/dealroom" : "/login?redirect=/dealroom"}
                  className="btn-primary text-xs sm:text-sm py-3 px-5 sm:px-6 shadow-md flex items-center gap-2"
                >
                  <span>{user ? t('ডিল রুম খুলুন', 'Open Deal Room') : t('ডিল রুম চালু করুন', 'Launch Deal Room')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Direct Video CTA linking to #platform-video */}
                <a
                  href="#platform-video"
                  className="inline-flex items-center gap-2 py-3 px-4 sm:px-5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>{t('ভিডিও ডেমো (৩ মি.)', 'Watch Pitch Video (3m)')}</span>
                </a>

                <Link
                  to="/buyers"
                  className="btn-secondary text-xs sm:text-sm py-3 px-4"
                >
                  <span>{t('বায়ারদের তালিকা', 'Browse Importers')}</span>
                  <ChevronRight className="w-4 h-4 ml-1 text-slate-500" />
                </Link>

                <VoiceGuideButton trackKey="landing_hero" />
              </div>

              {/* Data Privacy & Sovereign Shield */}
              <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
                <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="leading-relaxed font-bangla text-[11px] sm:text-xs">
                  <strong className="text-slate-900 dark:text-slate-200">{t('আপনার তথ্য সম্পূর্ণ সুরক্ষিত:', '100% Data Sovereignty:')}</strong>{' '}
                  {t(
                    'বাণিজ্য পরামর্শে পাঠানোর আগে ক্লায়েন্ট-সাইডেই পরিচিত পরিচয় ও কর নম্বর আড়াল করা হয়। কোনো গোপন তথ্য তৃতীয় পক্ষের কাছে পৌঁছায় না।',
                    'Known identity and tax numbers are masked client-side before trade advice is requested. No confidential factory data is exposed.'
                  )}
                </p>
              </div>

            </div>

            {/* Right Column (5 cols): Interactive Globe + Preset Demo Cockpit */}
            <div className="lg:col-span-5 space-y-4 w-full">
              
              {/* Globe container with clean responsive height */}
              <div className="relative rounded-2xl overflow-hidden h-[420px] sm:h-[460px] lg:h-[480px] shadow-sm">
                <CanvasErrorBoundary>
                  <React.Suspense
                    fallback={
                      <div className="w-full h-full">
                        <TradeCorridorFallback />
                      </div>
                    }
                  >
                    <TradeCorridorGlobe theme={theme === 'dark' ? 'dark' : 'light'} className="w-full h-full" />
                  </React.Suspense>
                </CanvasErrorBoundary>
              </div>

              {/* Preset Selector Card with robust mobile grid */}
              <div className="card-institutional space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-bangla">
                      {t('লাইভ এক্সপোর্ট ডিল ডেমো', 'Live Export Deal Demo')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {t('প্রস্তুত ডিল', 'Ready Deal')}
                  </span>
                </div>

                {/* Preset Selector Tabs (2x2 on mobile, 4-col on tablet+) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {presets.map((p) => {
                    const isActive = p.id === selectedHeroPreset;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedHeroPreset(p.id)}
                        className={`py-1.5 px-1.5 rounded text-[11px] font-semibold transition-all truncate text-center ${
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

                {/* Active Deal Preview Details (Separated blocks to eliminate text overlap) */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentHeroItem.img}
                      alt={currentHeroItem.title}
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">
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

                  {/* Pricing & Margin with distinct vertical block spacing */}
                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[11px] font-bangla">{t('নমুনা FOB দর:', 'FOB price:')}</span>
                      <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                        {currentHeroItem.fob} USD / pc
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[11px] font-bangla">{t('কারখানার মার্জিন:', 'Factory margin:')}</span>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {currentHeroItem.margin}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchPreset(currentHeroItem.id)}
                  className="w-full btn-primary text-xs py-2.5 justify-center flex items-center shadow-sm"
                >
                  <span className="font-bangla">{t('এই পণ্যটি দিয়ে ডিল টেস্ট করুন', 'Test This Deal in Deal Room')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* Live Trade Ticker */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TradeTicker />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. DEDICATED PLATFORM VIDEO SECTION (#platform-video)              */}
        {/* ------------------------------------------------------------------ */}
        <section id="platform-video" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Play className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
              <span>{t('অফিসিয়াল ভিডিও ডেমো (৩ মিনিট)', 'Official Platform Tour (180s)')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
              {t('ভিডিওতে দেখুন ExportPilot AI কীভাবে কাজ করে', 'Watch ExportPilot AI in Action: Sovereign Trade OS')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bangla leading-relaxed">
              {t(
                'সাভার থেকে ইউরোপ ও যুক্তরাজ্যে সরাসরি এফওবি রপ্তানি, ইউরোপিয়ান সিবিএএম কার্বন কমপ্লায়েন্স ও এআই ডিল রুমের সম্পূর্ণ কার্যপ্রণালী ৩ মিনিটে জেনে নিন।',
                'See how factory owners recover up to 25% margin, audit European CBAM carbon footprint from utility bills, and generate bank-ready Proforma Invoices in seconds.'
              )}
            </p>
          </div>

          {/* Premium Video Chassis */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 shadow-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700">
            
            {/* Window Chrome Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-800/90 dark:bg-slate-900/90 border-b border-slate-700/60 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ef4444] inline-block shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#f59e0b] inline-block shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#10b981] inline-block shrink-0" />
                <span className="hidden sm:inline-block font-mono text-[11px] text-slate-300 dark:text-slate-400 ml-3 bg-slate-950/60 px-3 py-1 rounded-md border border-slate-700/50 truncate">
                  https://exportpilot.equisaas-bd.com/pitch-video
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-bold text-[10px] sm:text-[11px] text-emerald-400 uppercase tracking-wider">
                  1080P : 3:00 MIN
                </span>
              </div>
            </div>

            {/* Embedded 16:9 YouTube Video */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/fHR5ZNmKrxU?rel=0&modestbranding=1"
                title="ExportPilot AI Official Pitch Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Video Chapter Navigation & Highlights */}
            <div className="p-4 sm:p-6 bg-slate-900/95 dark:bg-slate-950 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span>0:00 - 0:30</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {t('সমস্যা ও মার্জিন লস', 'The Challenge')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bangla leading-tight">
                    {t('বায়িং হাউসের ২৫% মার্জিন কর্তন ও ২০২৬ সিবিএএম ঝুঁকি।', 'Buying house 25% margin cut and CBAM risk.')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span>0:30 - 1:00</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {t('সভরেন ট্রেড ওএস', 'Sovereign Platform')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bangla leading-tight">
                    {t('হামবুর্গ, লন্ডন ও টোকিওর সাথে সরাসরি এফওবি করিডোর।', 'Direct FOB corridors to Hamburg, London, Tokyo.')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span>1:00 - 2:00</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {t('লাইভ প্রোডাকশন ডেমো', 'Live Production Demo')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bangla leading-tight">
                    {t('সাভার জুট ব্যাগ, আরইবি বিদ্যুৎ বিল থেকে কার্বন অডিট।', 'Savar jute bag and REB bill carbon audit.')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span>2:00 - 2:30</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {t('মাল্টি-এজেন্ট ইঞ্জিন', 'FastMCP Engine')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bangla leading-tight">
                    {t('ক্লায়েন্ট-সাইড প্রাইভেসি ও ৫টি বিশেষায়িত এজেন্ট।', 'Client-side privacy and 5 specialized agents.')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                    <span>2:30 - 3:00</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {t('বাস্তব প্রভাব ও বিস্তার', 'Scale & Proven Impact')}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bangla leading-tight">
                    {t('অ্যাজিউর ক্লাউড ও ৬৪ জেলায় জাতীয় সম্প্রসারণ।', 'Azure cloud and 64 district expansion.')}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 3. THREE-STEP WORKFLOW (#how-it-works)                             */}
        {/* ------------------------------------------------------------------ */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              {t('সরল প্রক্রিয়া', 'Simple Workflow')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
              {t('৩টি সহজ ধাপে কারখানা থেকে সরাসরি আন্তর্জাতিক রপ্তানি', 'Direct International Export in 3 Simple Steps')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla">
              {t(
                'কোনো মধ্যস্থতাকারী বায়িং হাউস ছাড়াই কারখানা থেকেই সম্পন্ন করুন সম্পূর্ণ আন্তর্জাতিক এক্সপোর্ট প্রসেস।',
                'Prepare key export details and work directly with potential global buyers.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="card-institutional space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
                  <UploadCloud className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bangla">
                  {t('ইনপুট পর্যায়', 'Input Phase')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('ছবি তুলুন বা মুখে বলুন', 'Upload Photo or Speak in Bangla')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'মোবাইলে পণ্যের ছবি তুলুন অথবা বাংলায় পণ্যের বিবরণ বলুন। এআই স্বয়ংক্রিয়ভাবে স্পেসিফিকেশন গুছিয়ে নেয়।',
                  'Upload a product photo or describe it in spoken Bangla. The AI structures technical specifications automatically.'
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-institutional space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
                  <Globe className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bangla">
                  {t('বিশ্লেষণ পর্যায়', 'Analysis Phase')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('সম্ভাব্য বাজার ও শুল্কের তথ্য পর্যালোচনা', 'Review Potential Markets & Tariffs')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'প্রাথমিক HS কোড, ইউরোপিয়ান সিবিএএম কার্বন রেফারেন্স ও শুল্কমুক্ত সুবিধা দেখুন এবং বায়ার চাহিদার সাথে মেলান।',
                  'Review suggested HS codes, European CBAM carbon thresholds, and duty-free benefits across target destinations.'
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-institutional space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm shadow-sm">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bangla">
                  {t('চুক্তি পর্যায়', 'Contract Phase')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bangla">
                {t('প্রফরমা ইনভয়েস ও চুক্তি প্রস্তুত', 'Download Proforma Invoice & L/C Draft')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bangla">
                {t(
                  'বাংলাদেশ ব্যাংকের নগদ সহায়তা যাচাইকৃত ব্যাংক-রেডি প্রফর্মা ইনভয়েস ও এল/সি শর্তাবলী প্রস্তুত করুন।',
                  'Generate compliant proforma invoices with Bangladesh Bank export incentive verification and irrevocable L/C terms.'
                )}
              </p>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 4. DIRECT EXPORT MARGIN ESTIMATOR (#calculator)                    */}
        {/* ------------------------------------------------------------------ */}
        <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="card-institutional space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-bangla">
                    {t('সরাসরি রপ্তানি লাভ ক্যালকুলেটর', 'Direct Export Profit Estimator')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bangla">
                  {t(
                    'চালানের পরিমাণ ও উৎপাদন খরচ দিয়ে সম্ভাব্য বাড়তি আয় হিসাব করুন।',
                    'Estimate additional earnings recovered by bypassing middleman buying houses.'
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <VoiceGuideButton trackKey="calculator" />
                <div className="text-left sm:text-right p-3.5 sm:p-4 rounded-xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-800 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                    {t('চালানপ্রতি সম্ভাব্য বাড়তি আয়', 'Estimated Gain Per Shipment')}
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                    +${directGainUsd.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-emerald-800 dark:text-slate-300 font-bangla font-semibold">
                    (+{directGainLakhBdt} {t('লাখ টাকা বাড়তি মার্জিন', 'Lakh BDT recovered')})
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Volume Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500 font-bangla mr-1">{t('দ্রুত পরিমাণ নির্বাচন:', 'Quick volume select:')}</span>
              {[5000, 10000, 25000, 50000].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setUnits(vol)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    units === vol
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  {vol.toLocaleString()} {t('পিস', 'pcs')}
                </button>
              ))}
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-2">
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

            {/* Comparative Economics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-bangla">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span>{t('লোকাল বায়িং হাউস মার্জিন: ৮%', 'Buying House Margin: ~8%')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span>{t('সরাসরি আন্তর্জাতিক FOB: ৩০%', 'Direct International FOB: ~30%')}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{t('কারখানার বাড়তি মার্জিন: +২২% সরাসরি সাশ্রয়', 'Factory Gain: +22% recovered margin')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 font-bangla">
                {t('এই ক্যালকুলেটরটি নমুনা হিসাব দেখায়। প্রকৃত লাভ পণ্যের খরচ, দর, চালান ও চুক্তির শর্ত অনুযায়ী নির্ধারিত হবে।', 'Illustrative estimate only. Actual returns depend on factory production cost, final FOB price, and contract terms.')}
              </p>
              <button
                type="button"
                onClick={handleLaunchCalculator}
                className="btn-primary text-xs py-2.5 px-5 shrink-0 flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
              >
                <span className="font-bangla">{t('এই মার্জিন দিয়ে ডিল রুম চালু করুন', 'Launch Deal Room with This Margin')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 5. FLAGSHIP NATIONAL SECTORS (#sectors)                            */}
        {/* ------------------------------------------------------------------ */}
        <section id="sectors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                {t('শীর্ষ পণ্যসমূহ', 'Top Export Products')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-bangla">
                {t('বাংলাদেশের ৪টি শীর্ষ জাতীয় রপ্তানি পণ্য', 'Bangladesh 4 National Flagship Export Sectors')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bangla max-w-2xl">
                {t(
                  'পাট, তৈরি পোশাক, চামড়া ও সিরামিকসহ বাংলাদেশের মূল রপ্তানি খাতের পণ্যের বিবরণ এক জায়গায় গুছিয়ে নিন। গন্তব্য অনুযায়ী শুল্ক ও কমপ্লায়েন্সের শর্ত যাচাই করুন।',
                  'Organize product details for key Bangladesh export sectors, including jute, garments, leather, and ceramics. Review tariff eligibility and compliance requirements for each destination.'
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
                className="card-institutional card-institutional-hover flex flex-col justify-between space-y-4 group"
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div className="flex justify-between items-center gap-2">
                      <span className="shrink-0">{t('প্রধান বাজার:', 'Target Markets:')}</span>
                      <span className="text-slate-800 dark:text-slate-300 font-medium truncate text-right">{p.markets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('কার্বন স্কোর:', 'Carbon Footprint:')}</span>
                      <span className="text-slate-800 dark:text-slate-300 font-mono">{p.co2}</span>
                    </div>
                    <div className="flex justify-between items-center">
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

        {/* ------------------------------------------------------------------ */}
        {/* 6. EXPORT FAQ SECTION (#export-faq)                                */}
        {/* ------------------------------------------------------------------ */}
        <section id="export-faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <header className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-bangla">
              {t('রপ্তানি প্রস্তুতি নিয়ে সাধারণ প্রশ্ন', 'Export preparation questions')}
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 font-bangla">
              {t('শুল্ক, উৎপত্তির নিয়ম ও কমপ্লায়েন্স চালানের আগে সংশ্লিষ্ট কর্তৃপক্ষ ও বায়ারের সঙ্গে যাচাই করুন।', 'Confirm tariffs, origin rules, and compliance requirements with the relevant authorities and buyer before shipment.')}
            </p>
          </header>
          
          {/* Accessible React Accordion: completely avoids native details layout collision */}
          <div className="space-y-3">
            {seoConfig.homeFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.questionEn}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 font-bangla">
                      {t(faq.questionBn, faq.questionEn)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-bangla">
                        {t(faq.answerBn, faq.answerEn)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
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
